# iikane-palette-keion-app #
いいかねパレット軽音部アプリ

## Environment
- Node.js v20.6.0
- pnpm
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
