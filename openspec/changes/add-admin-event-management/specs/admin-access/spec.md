## ADDED Requirements

### Requirement: 管理者フラグ
システムは User ごとに管理者フラグを持たなければならない (SHALL)。既定値は管理者でないこととし、付与は DB を直接更新して行う。

#### Scenario: 新規ユーザーは管理者でない
- **WHEN** Discord でサインアップしたユーザーが作成される
- **THEN** そのユーザーは管理者ではない

### Requirement: 管理 API の認可
管理者向け API は、管理者のセッションからの呼び出しだけを受け付けなければならない (SHALL)。

#### Scenario: 未ログインの呼び出し
- **WHEN** 未ログインで管理 API を呼ぶ
- **THEN** `UNAUTHORIZED` で拒否される

#### Scenario: 管理者でないユーザーの呼び出し
- **WHEN** 管理者でないログインユーザーが管理 API を呼ぶ
- **THEN** `FORBIDDEN` で拒否される

### Requirement: 管理画面へのアクセス制限
`/admin` 以下のページは管理者にだけ表示し、それ以外には存在を明かさない (SHALL)。

#### Scenario: 管理者でないユーザーが管理画面を開く
- **WHEN** 未ログインまたは管理者でないユーザーが `/admin` を開く
- **THEN** 404 が表示される

#### Scenario: 管理者が管理画面を開く
- **WHEN** 管理者が `/admin` を開く
- **THEN** 下書きを含むイベント一覧が表示される
