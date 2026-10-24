# Project Context

## Purpose
軽音楽部（Light Music Club）のコミュニティWebアプリケーション。メンバー管理、イベント管理、バンド管理、およびSpotifyとの連携によるお気に入り楽曲機能を提供する。

主な機能:
- **メンバー管理**: ユーザープロフィール、SNSリンク、タグ管理
- **イベント管理**: ライブイベントの作成・閲覧、バンド情報、写真・動画管理
- **管理画面**: 管理者（`User.isAdmin`）がイベント・バンド・メンバー・画像・レク王を編集する。イベントは下書きで作り、公開するまで公開ページに出さない
- **My Best Songs**: Spotify APIを使った楽曲検索とお気に入りリスト作成（ドラッグ&ドロップで並び替え可能）
- **オンボーディング**: 新規ユーザー向けの初回設定フロー

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: React 19
- **Database**: PostgreSQL + Prisma ORM
- **API**: tRPC (type-safe API)
- **Authentication**: NextAuth.js v5 (Discord OAuth、データベースセッション)
- **UI Components**: Mantine UI v8
- **Storage**: Supabase (ファイルストレージ)
- **State Management**: Zustand, TanStack React Query
- **Form Handling**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **Rich Text Editor**: TipTap
- **Validation**: Zod + zod-prisma-types
- **Runtime**: Node.js 24, pnpm 10

## Project Conventions

### Code Style
- **ESLint**: eslint-config-next + typescript-eslint
- **Prettier**: コードフォーマット
- **TypeScript**: strict mode、noUncheckedIndexedAccess有効
- **Import順序**: builtin → external → internal → parent/sibling → object → index → type
- **Type imports**: `import { type Foo }` 形式を推奨
- **JSX props**: key/refを先頭に、コールバックを最後に配置
- **早期リターン**: ネストを浅く保つため優先的に使用
- **コメント**: 必要最小限（処理が複雑な場合、意図がコードから読み取れない場合のみ）
- **Path alias**: `@/*` で `src/` を参照

### Architecture Patterns
```
src/
├── app/                    # Next.js App Router (pages, API routes)
├── features/               # 機能別モジュール（コンポーネント、hooks、ロジック）
│   ├── account/           # アカウント管理
│   ├── admin/             # 管理画面
│   ├── application/       # 共通アプリケーションUI
│   ├── event/             # イベント機能
│   ├── my-best-songs/     # お気に入り楽曲機能
│   └── user/              # ユーザープロフィール
├── server/                 # バックエンドロジック
│   ├── api/               # tRPCルーター
│   │   └── routers/       # 各ドメインのルーター
│   ├── applications/      # アプリケーションサービス
│   └── db.ts              # Prismaクライアント
├── ui/                     # 共通UIコンポーネント
├── utils/                  # ユーティリティ関数
└── types/                  # 型定義（生成されたZod型含む）
```

**パターン**:
- tRPC: 入力バリデーション（Zod）、認証済み/未認証プロシージャ
- Feature modules: 各機能が自己完結（components, hooks, logics, actions）。Server Action は部品の横の `actions.ts` か、機能直下の `actions/` に置く
- Server/Client分離: `src/trpc/server.ts` は `server-only` で保護する。DB・Storage・秘密鍵を扱うサーバー側のモジュールはクライアントコンポーネントから import しない（型と zod スキーマだけは共有してよい）

### Testing Strategy
- **ユニットテスト**: Vitest。対象ファイルの横に `*.test.ts` を置く（`pnpm test`）
- **E2E**: Playwright。`e2e/*.spec.ts`（`pnpm e2e`）。ローカルの DB と Supabase を使う
- **CI**: PR ごとに lint・ユニットテスト・build と E2E を流す

### Git Workflow
- **Husky**: Git hooks管理
- **lint-staged**: コミット前にlint/format実行
- **コミットメッセージ**: 日本語または英語（規約なし）

## Domain Context
### 主要エンティティ
- **User**: Discordアカウントと連携、プロフィール情報、SNSリンク
- **UserTag**: ユーザーに付与できるタグ（担当楽器、好きなジャンル等）
- **Event**: ライブイベント（日時、説明、写真、動画リンク）
- **Band**: イベントに紐づくバンド（出演順、メンバー、パート）
- **MyBestSong**: ユーザーのお気に入り楽曲（Spotify ID、順序、track/album種別）
- **Onboarding**: ユーザーのオンボーディング進捗

### 用語
- **RecreationKing**: イベントのレクリエーション王（表彰機能）
- **liveOrder**: バンドの出演順序

## Important Constraints
- **認証必須**: Discord OAuth経由のみ（他の認証方式は未対応）
- **招待制**: 特定コミュニティ向けの非公開アプリケーション
- **Spotify API制限**: 楽曲検索はSpotify APIのレート制限に従う

## External Dependencies
| サービス | 用途 | 備考 |
|---------|------|------|
| **Supabase** | ファイルストレージ（画像） | アバター、イベント画像、バンド写真 |
| **Spotify API** | 楽曲検索 | Client Credentials認証 |
| **Discord OAuth** | ユーザー認証 | NextAuth.js経由 |
| **PostgreSQL** | データベース | Prisma ORM経由、Supabase Pooler使用可 |
