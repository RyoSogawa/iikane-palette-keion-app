# Tasks: Next.js 15 / React 19 アップグレード

## 1. 事前調査
- [ ] 1.1 現在の依存パッケージの互換性を確認
- [ ] 1.2 Next.js 15のbreaking changesを確認
- [ ] 1.3 React 19のbreaking changesを確認

## 2. コアパッケージの更新
- [ ] 2.1 next, react, react-domを最新バージョンに更新
- [ ] 2.2 @types/react, @types/react-domを更新
- [ ] 2.3 eslint-config-nextを更新

## 3. 関連パッケージの互換性対応
- [ ] 3.1 tRPC関連パッケージの互換性確認・更新
- [ ] 3.2 NextAuth.jsの互換性確認・更新
- [ ] 3.3 Mantine UIの互換性確認・更新
- [ ] 3.4 TanStack React Queryの互換性確認・更新
- [ ] 3.5 @dnd-kitの互換性確認・更新
- [ ] 3.6 TipTapの互換性確認・更新

## 4. コード修正
- [ ] 4.1 next.config.jsの更新（必要に応じて）
- [ ] 4.2 非推奨APIの使用箇所を修正
- [ ] 4.3 新しいAPI/パターンへの移行

## 5. 検証
- [ ] 5.1 pnpm installが成功することを確認
- [ ] 5.2 pnpm buildが成功することを確認
- [ ] 5.3 pnpm devで開発サーバーが起動することを確認
- [ ] 5.4 主要機能の動作確認（イベント、メンバー、My Best Songs）

## 6. ドキュメント更新
- [ ] 6.1 openspec/project.mdのTech Stackを更新
