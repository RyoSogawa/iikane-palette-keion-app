## 1. データモデル
- [x] 1.1 `User.isAdmin` と `Event.isDraft`（どちらも default false）を schema に追加し、Prisma マイグレーションを作成する
- [x] 1.2 zod 型を再生成する
- [x] 1.3 seed の先頭ユーザーを管理者にする（seed にはイベント自体が無いので下書きイベントは入れない）

## 2. 認可
- [x] 2.1 `Session.user` / `AdapterUser` に `isAdmin` を型拡張し、`toClientSession` で返す（テスト追加）
- [x] 2.2 `adminProcedure` を追加する（非ログインは `UNAUTHORIZED`、非管理者は `FORBIDDEN` のテスト）
- [x] 2.3 `src/app/admin/layout.tsx` で非管理者・未ログインに `notFound()` を返す

## 3. 下書きの公開除外
- [x] 3.1 `event.getAll` / `event.findById` で `isDraft: false` に絞る（下書きが返らないテスト）
- [x] 3.2 バンドページも親イベントが下書きなら表示しない
- [x] 3.3 公開ページで見つからないときに `notFound()` を返す

## 4. 公開ページの共有コンポーネント化
- [x] 4.1 イベント詳細の本体を `features/event/components/EventDetail` に切り出す
- [x] 4.2 バンド詳細の本体を `features/event/components/BandDetail` に切り出す
- [ ] 4.3 切り出し前後で公開ページの見た目が変わらないことを確認する（E2E とビルドは通過。目視は未実施）

## 5. 管理 API（`src/server/api/routers/admin/`）
- [x] 5.1 イベント: 一覧（下書き含む、作成日時・更新日時つき）/ 取得 / 作成（下書きで作成）/ 更新 / 削除 / 公開・非公開切り替え
- [x] 5.2 バンド: 作成 / 更新 / 削除 / 出演順の並び替え
- [x] 5.3 バンドメンバー: 追加 / 更新（表示名・パート）/ 削除 / 並び替え、ユーザー検索
- [x] 5.4 レクリエーション王: 設定 / 解除
- [x] 5.5 すべてのミューテーション後に `revalidateEventPages(eventId)` を呼ぶ
- [x] 5.6 入力の Zod 検証（URL、`dateFrom <= dateTo`、文字数）とテスト

## 6. 画像アップロード
- [x] 6.1 Supabase マイグレーションで `events` バケットと管理者のみ書き込める RLS を追加する
- [x] 6.2 `createSupabaseClientForAdmin`（`app_role: admin` を含む短命 JWT）を追加する
- [x] 6.3 `resizeImageForUpload` を共有ユーティリティに移す（長辺 1200px のままで足りるので引数化はしない）
- [x] 6.4 イベント / バンド画像の保存サービス（WebP 変換、古いファイルの削除）とテスト
- [x] 6.5 管理者を再確認する Server Action を追加する

## 7. 管理画面 UI（`src/app/admin/`, `src/features/admin/`）
- [x] 7.1 イベント一覧（公開状態バッジ、作成日時・更新日時、新規作成ボタン）
- [x] 7.2 イベント編集フォーム（基本情報、画像、公開/下書き切り替え、削除確認は Mantine Modal）
- [x] 7.3 バンド編集（追加・編集・削除、`@dnd-kit` で出演順の並び替え）
- [x] 7.4 バンドメンバー編集（ユーザー選択、表示名、パート、並び替え）
- [x] 7.5 レクリエーション王の選択
- [x] 7.6 イベント / バンドのプレビュー画面（共有コンポーネントで描画、下書きバッジ表示）
- [x] 7.7 管理者にだけヘッダー等に管理画面への導線を出す

## 8. E2E とドキュメント
- [x] 8.1 E2E fixture に管理者ユーザーを追加する
- [x] 8.2 E2E: 非管理者は `/admin` が 404、管理者は下書きを作成・プレビュー・公開でき、公開前は `/events` に出ない
- [x] 8.3 README に管理者付与の SQL を記載する
- [x] 8.4 `pnpm lint` / `pnpm test` / `pnpm build` / E2E がすべて通ることを確認する
