# Design: セッションページ

## Context
- 当日の現場でスマホから使う。使うのは一時的なので、実装の単純さを優先する（2026-11-11 に確認）
- デプロイ先は Vercel（サーバーレス）。常時接続の WebSocket サーバーは自前で置けない
- リアルタイム更新の仕組みは今は何もない。Supabase は Storage にだけ、サーバーからだけ使っている
- パートを表す型は DB に無い。`UserOnBand.part` は自由入力の文字列
- `Session` は NextAuth の Prisma モデル名で、コード全体で `session` は認証セッションを指す
- 画面イメージ: https://claude.ai/artifact/RSbHbPM7J9jwbLtXXg93TN

## Goals / Non-Goals
- Goals: いまいる人とそのパートが分かる。メンバーが曲を挙げ、パートで手を挙げられる。人が集まっている曲が分かる。ほかの人の操作が数秒で画面に出る
- Non-Goals: PC レイアウト、セッション会ごとのボード、バンド編成、即時（1 秒未満）の反映

## Decisions

### 1. 名前は `jam-session` / `JamSession*` に統一する
- URL は `/jam-session`、feature は `src/features/jam-session`、tRPC ルーターは `jamSession`
- 画面上の表記は「セッション」
- 理由: 認証の `Session` / `session` と混ざると、grep でも会話でも取り違える

### 2. データモデル
```prisma
enum JamSessionPart {
  vocal
  guitar
  bass
  drums
  keyboard
  wind
  strings
  percussion
  other
}

model JamSessionSong {
  id         String            @id @default(cuid())
  createdAt  DateTime          @default(now())
  proposerId String?
  proposer   User?             @relation(fields: [proposerId], references: [id], onDelete: SetNull)
  spotifyId  String?           @unique
  name       String?
  artist     String?
  playedAt   DateTime?
  entries    JamSessionEntry[]
}

model JamSessionEntry {
  id        String         @id @default(cuid())
  createdAt DateTime       @default(now())
  songId    String
  song      JamSessionSong @relation(fields: [songId], references: [id], onDelete: Cascade)
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  part      JamSessionPart
  partNote  String?

  @@unique([songId, userId, part])
  @@index([userId])
}

model JamSessionParticipant {
  userId     String           @id
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  parts      JamSessionPart[]
  partNote   String?
  roots      String[]
  joinedAt   DateTime?
}
```
- 曲を挙げた人の担当パートも `JamSessionEntry` として持つ。「挙げた人」と「手を挙げた人」を同じ形で集計できる
- 退会したとき: その人の Entry と Participant は消す（`Cascade`）。挙げた曲はほかの人の Entry が付いているので残し、`proposerId` を null にする（`SetNull`）。提案者がいない曲は管理者だけが消せる
- `spotifyId` は自由入力なら null。Postgres の unique は null どうしを重複と見なさないので、Spotify の曲だけ 1 件に絞れる
- 曲名とアーティスト名は `MyBestSong` と同じく DB に持つ。自由入力は曲名とアーティスト名のどちらか一方があればよく、両方空は zod で弾く。曲名が無い曲は「<アーティスト名> の曲なにか」と表示する
- `playedAt` が入っている曲が「演奏済み」。状態は未演奏と演奏済みの 2 つだけなので、enum のステータスにはしない
- Spotify のジャケット画像は扱わない。一覧を詰めるので表示する場所が無く、保存もキャッシュも要らなくなる
- `part = other` のときだけ `partNote`（30 文字まで）を必須にする。この条件は DB ではなく zod で検査する
- ルーツは選択肢からの複数選択と自由入力を、区別せず `String[]` に入れる（1 件 20 文字まで、8 件まで）。選択肢は `src/features/jam-session/logics/roots.ts` に定数で持ち、画面の候補としてだけ使う
  - 選択肢: ロック / J-POP / 歌謡曲 / ジャズ / ファンク・ソウル / メタル
- できるパートとルーツは `User` ではなく `JamSessionParticipant` に持つ。一時的な機能なので、消すときにこの 3 テーブルを落とせば済むようにする
- パートの表示名と並び順は `src/features/jam-session/logics/parts.ts` に 1 か所で持つ

### 3. 「いまここにいる人」は参加・退出の操作で決める
- 「参加する」で `JamSessionParticipant.joinedAt` に現在時刻を入れ、「退出する」で null に戻す。行そのものは残すので、次に参加するときはパートとルーツが入った状態から始められる
- 参加中 = `joinedAt` が 24 時間以内。退出を忘れた人が次回のセッションまで残らないよう、時間で切る。判定は `board` のクエリの where 句だけで行い、定期実行は置かない
- 参加中のメンバーは、ほかの参加中のメンバーを退出させられる（確認つき）。退出させられた人は自分で参加し直せる。部員どうしの信頼を前提に、管理者に限定しない
- 曲を挙げる・手を挙げる・演奏済みにする操作は参加中のメンバーだけに許す。未参加で押したら参加のポップアップを出す
- 退出しても、その人の Entry は消さない。`board` は参加中のメンバーの Entry だけを返すので、退出中は人数にもパートにも数えられず、参加し直すと元に戻る
- 手を挙げている参加中のメンバーが 0 人になった曲も一覧に残す（人数 0 として下に並ぶ）
- 代替案
  - ページを開いた記録（最終アクセス時刻）で決める: 操作は要らないが、演奏中にスマホを閉じた人と帰った人を区別できない
  - Supabase Realtime の Presence: スマホを閉じると消える。anon key の公開も必要になる

### 4. API はすべて `protectedProcedure` の tRPC
| procedure | 内容 |
|---|---|
| `jamSession.board` | 参加中のメンバーと、全曲と参加中のメンバーの Entry、自分の参加状態とプロフィールを 1 回で返す |
| `jamSession.join` | できるパートとルーツを保存して参加する。参加中に呼べばプロフィールの更新になる |
| `jamSession.leave` | `userId` を省けば自分が退出する。指定すればその人を退出させる（呼ぶ側が参加中のときだけ） |
| `jamSession.setPlayed` | 曲を演奏済みにする・戻す（参加中のメンバーなら誰でも） |
| `jamSession.createSong` | 曲と自分の Entry（1 件以上）を 1 トランザクションで作る。`spotifyId` が既にあれば `CONFLICT` |
| `jamSession.deleteSong` | 提案者本人か管理者だけ。それ以外は `FORBIDDEN` |
| `jamSession.setMyParts` | ある曲について自分のパート一式を置き換える（空なら取り下げ） |
- `createSong` は Spotify の曲なら `spotifyId` だけを受け取り、曲名とアーティスト名はサーバーが Spotify から取り直す。クライアントが送った値を使うと、偽の曲名で本物の `spotifyId` を先取りできてしまう
- 入力の上限: 曲名 100 文字、アーティスト名 100 文字、`partNote` 30 文字
- Spotify 検索は既存の `myBestSongs.search` を `type: 'track'` で呼ぶ
- Server Action は使わない。ファイルを扱わない更新は tRPC という既存の使い分けに合わせる

### 5. 自動更新はポーリング
- `jamSession.board` を `refetchInterval: 5000` で取り直す。React Query の既定で、タブが裏にある間は止まり、戻ったときに取り直す
- 自分の操作は mutation の成功後にすぐ取り直すので、待たずに反映される
- 理由: 追加の仕組みが要らない。Supabase Realtime を使う案は、anon key の公開、ブラウザ用トークン、Storage のポリシー追加、CI の変更が必要で、一時的な機能には重い
- 負荷: 30 人が開いていて毎秒 6 リクエスト。クエリは 2 本（Participant と Song + Entry）で、行数は数十〜数百

### 6. 並び順と集計は純関数にする
- 未演奏の曲を先に、演奏済みの曲を後ろに並べる
- それぞれの中では、手を挙げている参加中のメンバーの人数（同じ人が複数パートでも 1 人）が多い順、同数なら新しく挙がった順
- 曲ごとのパート表示: Vo / Gt / Ba / Dr は誰もいなくても「募集」として出す。それ以外のパートは手を挙げた人がいるときだけ出す
- `src/features/jam-session/logics/` に置き、Vitest で検査する

### 7. ページとナビゲーション
- `src/app/jam-session/page.tsx`: `getServerAuthSession()` で未ログインなら `redirect('/')`、`dynamic = 'force-dynamic'`。初期データは RSC で取り、クライアントの `useQuery` の `initialData` に渡す
- スマホ幅だけを設計する。PC では最大幅を絞って中央に出す
- 未参加の人には、一覧の上に「参加する」の案内を出す。押すと「自分のパートとルーツ」のポップアップが開き、保存すると参加になる
- 「いまここにいる人」はアバターだけを横に並べ、パート別とルーツ別を切り替えて表示する（初期はパート別）。複数のパートやルーツを持つ人は、それぞれのグループに出る。まとめ方の選択は画面内の state にだけ持ち、保存しない
  - パート別では Vo / Gt / Ba / Dr / Key を誰もいなくても出し、いないパートが分かるようにする。ルーツ別は 1 人以上いるものだけを出す
  - グループ分けは純関数にして `logics` に置く
- アバターをタップすると、その人の名前・パート・ルーツ・挙手中の曲と「退出させる」が出る
  - その下に、その人の My Best Songs のジャケットを小さいタイルで敷き詰める（1 行 5 枚、スクロールで全件）。タップで曲名とアーティスト名が分かるようにする
  - データは既存の `myBestSongs.findByUserId` をモーダルを開いたときに呼ぶ。画像は My Best Songs と同じく表示のたびに Spotify から取るので、DB には保存しない
  - 登録が 0 件の人は、この欄を出さない
- `NavMenu` は `AdminMenu` と同じ形で、ログイン中だけ項目を足す
- Spotify 検索の部品（`useSearchSpotify`, `MusicSearchInput`, `MusicCard`）は `features/my-best-songs` から import して使う。`MusicSearchInput` の Track / Album 切り替えは props で隠せるようにする

## Risks / Trade-offs
- 反映が最大 5 秒遅れる → 現場で声を掛け合いながら使うので許容する
- 誰でもほかの人を退出させられる → いたずらはできるが、本人が押し直せば戻り、Entry も消えない。部内の利用なので許容する
- 退出を忘れた人は最大 24 時間残る → ほかの人が退出させられる
- 一時的な機能がコードに残り続ける → 3 テーブルと `jam-session` のディレクトリに閉じているので、消すときは別の change で落とす

## Migration Plan
1. Prisma マイグレーション（3 テーブルと enum）を出す。既存データは変えない。本番の既存テーブルに合わせて、新しいテーブルも `ENABLE ROW LEVEL SECURITY` する
2. デプロイする。環境変数の追加は無い
3. ロールバック: デプロイを戻す。テーブルは残っていても害が無い

## Open Questions
- 演奏済みの曲を、次回のセッションの前にまとめて消す操作は要るか。この提案では作らない（管理者が 1 曲ずつ消せる）
