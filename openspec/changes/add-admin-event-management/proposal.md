# Change: 管理者によるイベント管理機能と下書きイベントを追加する

## Why
イベント・バンド・出演メンバーのデータは現在 tRPC に読み取り API しかなく、登録や修正は DB を直接触るしかない。
運営メンバーがブラウザからイベントページを作成・編集でき、公開前の内容を一般ユーザーに見せずに準備できるようにしたい。

## What Changes
- `User` に管理者フラグ `isAdmin` を追加する。付与は DB 直接（SQL / Prisma Studio）のみで、画面からの付与・剥奪は作らない
  ```sql
  update "User" set "isAdmin" = true where id = '<userId>';
  ```
- セッションに `isAdmin` を載せ、tRPC に管理者専用の `adminProcedure`（非管理者は `FORBIDDEN`）を追加する
- 管理画面 `/admin` を追加する。管理者以外には存在を明かさないよう 404 を返す
- 管理画面でイベントに関するデータを登録・編集・削除できるようにする
  - イベント基本情報（名前・説明・開催日時・動画・Drive リンク）
  - バンド（追加・編集・削除・出演順の並び替え）
  - バンドメンバー（登録ユーザーの選択、表示名の上書き、パート、並び順）
  - 画像（イベント画像、バンドの photo / image / typoImage）の Supabase Storage へのアップロード
  - レクリエーション王の設定
- `Event` に下書きフラグ `isDraft` を追加する
  - 下書きのイベントは一般向けの一覧・詳細・バンドページに一切出さない（管理者でも公開ルートでは見えない）
  - 管理画面内のプレビューで、公開後のイベントページ・バンドページと同じ見た目を確認できる
  - 管理画面から作成したイベントは下書きで始まり、明示的に公開する
- 管理画面の一覧で、各イベントの公開状態・作成日時・更新日時を表示する
- 既存イベントは `isDraft = false`（公開済み）のまま移行する

## Impact
- Affected specs（すべて新規）: `admin-access`, `event-admin-management`, `event-draft`
- Affected code:
  - `prisma/schema.prisma` と新規マイグレーション、`src/types/generated/zod`
  - `src/server/auth.ts`, `src/server/client-session.ts`（セッションに `isAdmin`）
  - `src/server/api/trpc.ts`（`adminProcedure`）、`src/server/api/routers/event/*`（下書き除外）、新規 `src/server/api/routers/admin/*`
  - `src/app/events/**`（ページ本体を共有コンポーネントへ切り出し、存在しないときは `notFound()`）
  - 新規 `src/app/admin/**`, `src/features/admin/**`
  - `src/utils/supabase.ts`（管理者用クライアント）、新規 `supabase/migrations/*`（events バケットと RLS）
  - `e2e/`（管理者ユーザーの fixture と E2E）

## Out of Scope
- 画面からの管理者付与・剥奪
- Discord 未登録者のバンドメンバー登録（`UserOnBand.userId` が必須 FK のため。必要になったら別 change で扱う）
- 変更履歴（監査ログ）
