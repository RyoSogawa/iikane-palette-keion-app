# iikane-palette-keion-app #
いいかねパレット軽音部アプリ

## Environment
- Node.js v24.22.1
- pnpm v10.34.7
- Next.js
- tRPC
- Prisma
- Supabase
- Mantine-UI

## Getting Started
### 1. install supabase cli
https://supabase.com/docs/guides/cli/getting-started
```bash
$ brew install supabase/tap/supabase
$ supabase init # needs access token
$ supabase start
$ supabase stop # stop docker container
```

### 2. setup DB
https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding
```bash
$ prisma db push
$ pnpm db:seed # seed data
$ pnpm db:clear # clear all data
$ pnpm db:migrate # create migration file
```

## 管理画面

`/admin` でイベント・バンド・メンバー・画像・レク王を登録、編集できる。管理者以外には 404 になる。

管理者の付与と解除は画面からはできないので、DB を直接更新する。

```sql
update "User" set "isAdmin" = true where id = '<userId>';
```

管理画面から作ったイベントは下書きになり、「公開する」まで公開ページには出ない。
