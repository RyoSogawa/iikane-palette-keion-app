# Design: 管理者によるイベント管理機能と下書きイベント

## Context
- 認証は NextAuth v5 のデータベースセッション。`session` コールバックはリクエストごとに DB の User 行を受け取る
- イベント系の tRPC は `publicProcedure` の `event.getAll` / `event.findById` のみ
- 公開イベントページは `revalidate = 3600` で ISR キャッシュされている
- Storage への書き込みは、サーバーで NextAuth ユーザー用の JWT を自前署名し、RLS で判定している（`src/utils/supabase.ts`）
- アバターのアップロードは、クライアントで縮小してから Server Action に送っている（Server Action は既定 1MB で 413）
- `event.description` / `band.description` はプレーンテキストとして描画している

## Goals / Non-Goals
- Goals: 管理者だけがイベント関連データを CRUD できる。下書きは公開ルートから漏れない。管理画面で公開後の見た目をプレビューできる
- Non-Goals: 管理者の付与 UI、監査ログ、未登録ユーザーのバンドメンバー登録、細かいロール（編集者/閲覧者など）

## Decisions

### 1. 管理者判定は `User.isAdmin` とセッション
- `User.isAdmin Boolean @default(false)` を追加し、`toClientSession` で `isAdmin: user.isAdmin` を返す
- `next-auth` の `Session.user` と `next-auth/adapters` の `AdapterUser` を型拡張する
- データベースセッションなので、DB で `isAdmin` を外せば次のリクエストから反映される。失効の仕組みは別途不要
- 代替案: ロールテーブル。今は管理者か否かだけなので過剰

### 2. 認可はサーバー側で二重に
- tRPC: `adminProcedure = protectedProcedure.use(...)` で `isAdmin` でなければ `FORBIDDEN`。管理系の手続きはすべて `src/server/api/routers/admin/` に置き、`adminProcedure` 以外を使わない
- ページ: `src/app/admin/layout.tsx` でセッションを確認し、管理者でなければ `notFound()`。未ログインも同じく 404 にして管理画面の存在を明かさない。管理画面は `dynamic = 'force-dynamic'`
- Server Action（画像アップロード）: 内部で `getServerAuthSession()` を取り直し、`isAdmin` を確認してから処理する（Server Action は公開エンドポイントなので layout の判定に頼らない）

### 3. 下書きは公開 API で必ず除外
- `Event.isDraft Boolean @default(false)` を追加。既存行は公開のまま
- `event.getAll` / `event.findById` は `where: { isDraft: false }` を付ける。`findById` は `findFirst` に変える
- バンドページ（`/events/[eventId]/bands/[bandId]`）も親イベントが下書きなら見せない
- 公開ページは見つからないとき `throw new Error` ではなく `notFound()` を返す（下書きの存在も 404 で隠す）
- 管理画面から作るイベントは `isDraft: true` を明示して作成する

### 4. プレビューは公開ページと同じコンポーネントで描画する
- `src/app/events/[eventId]/page.tsx` とバンドページの本体を `src/features/event/components/EventDetail` / `BandDetail` に切り出し、データを props で受け取る形にする
- 管理画面の `/admin/events/[eventId]/preview`（とバンドのプレビュー）は、下書きも取得できる `admin.event.findById` の結果を同じコンポーネントに渡す。描画ロジックを二重に持たない
- プレビュー内のリンクは公開 URL を指すと下書きでは 404 になるため、リンク先を props で差し替えられるようにする

### 5. キャッシュの無効化
- 管理系のミューテーション（イベント・バンド・メンバー・画像・レク王・公開状態の変更・削除）の後に `revalidatePath('/events')` と `revalidatePath('/events/<eventId>', 'layout')`（バンドページも含む）、`revalidatePath('/members', 'layout')`（レク王の表示）を呼び、ISR の 1 時間キャッシュに編集が埋もれないようにする
- 呼び出しは 1 か所の関数（`revalidateEventPages(eventId)`）にまとめる

### 6. 画像は新しい `events` バケットに管理者だけが書き込む
- パス: `events/<eventId>/<kind>-<timestamp>.webp`（kind = `event` / `band-<bandId>-photo` など）
- RLS: 書き込み（insert / update / delete）は `bucket_id = 'events' and auth.jwt() ->> 'app_role' = 'admin'`、読み取りは public
- サーバーで管理者確認を済ませたあとだけ、`app_role: 'admin'` を含む短命 JWT のクライアント（`createSupabaseClientForAdmin`）を作る。ブラウザには渡さない
- クライアントでの縮小は既存の `resizeImageForUpload`（長辺 1200px の WebP）を `src/utils/` に移して共有する。公開ページの表示幅には 1200px で足り、Server Action の 1MB 制限にも収まるので `bodySizeLimit` は変えない
- サーバーで用途ごとの寸法の WebP に変換する（アバターの 300x300 は使わない）: イベント画像・バンド写真は長辺 1200px 以内、バンドのアイコン画像は 400x400 に切り抜き、タイポ画像は長辺 800px 以内で透過を残す
- 差し替え時は古いファイルを消す
- 代替案: service role キーでの書き込み。RLS を素通りするため、既存方針（ユーザー JWT + RLS）に揃える

### 7. バンドメンバーは登録ユーザーから選ぶ
- `UserOnBand.userId` は必須 FK かつ `@@id([userId, bandId])` なので、メンバーは登録ユーザーの中から選ぶ。`userName` は表示名の上書きとして任意入力にする
- 並び順（`order`）と出演順（`liveOrder`）は管理画面で並び替え、保存時に連番で振り直す。並び替え UI は既存の `@dnd-kit` を使う

### 8. 日時は JST に固定する
- 管理画面の日時入力（`datetime-local`）と一覧の日時表示は、実行環境のタイムゾーンを使わず JST に固定する
- サーバー（Vercel は UTC）とブラウザで描画結果が変わるとハイドレーションがずれるため。夏時間がないので +9 時間のオフセットで足りる

### 9. 入力検証
- 管理系の入力はすべて Zod で検証する（URL 形式、`dateFrom <= dateTo`、文字数上限など）。フォームも同じスキーマで先に検証し、項目ごとにエラーを出す
- 動画 URL は iframe の `src` に入るので、`javascript:` などを通さないよう `https:` に限る
- 説明文はプレーンテキストのまま扱う（HTML を受け付けないので sanitize は不要）

## Risks / Trade-offs
- 公開ページのリファクタで既存の見た目を壊すリスク → 切り出し前後で E2E / スクリーンショットで確認する
- `revalidatePath` の呼び忘れ → 共通関数に寄せ、ミューテーションのテストで呼ばれることを確認する
- 管理者が 1 人もいない状態ではイベントを作れない → 付与 SQL を proposal と README に記載する

## Migration Plan
1. Prisma マイグレーションで `User.isAdmin` と `Event.isDraft` を追加（どちらも default false なので既存データはそのまま）
2. Supabase マイグレーションで `events` バケットと RLS を追加
3. デプロイ後に運営メンバーへ SQL で `isAdmin = true` を付与
- ロールバック: カラムは default 付きの追加のみなので、コードを戻せば旧動作に戻る

## Open Questions
- なし（未登録メンバーの扱いは Out of Scope とした）
