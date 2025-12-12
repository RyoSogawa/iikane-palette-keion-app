# Change: Next.js 15 / React 19 へのアップグレード

## Why
現在のNext.js 14.1.0とReact 18.2.0を最新のNext.js 15系とReact 19系にアップグレードし、新機能・パフォーマンス改善・セキュリティアップデートを取り込む。

## What Changes
- **BREAKING**: Next.js 14 → 15（App Router改善、React 19対応）
- **BREAKING**: React 18 → 19（新しいhooks、コンパイラ最適化）
- **BREAKING**: React DOM 18 → 19
- 関連パッケージの互換性対応（@types/react、eslint-config-next等）
- tRPC、NextAuth、Mantineなどの依存パッケージの互換性確認

## Impact
- Affected specs: なし（新規spec）
- Affected code:
  - `package.json` - 依存関係の更新
  - `next.config.js` - Next.js 15の設定変更が必要な場合
  - `src/app/` - App Router関連の破壊的変更への対応
  - 全コンポーネント - React 19の非推奨API使用箇所の修正

## Risks
- tRPCとNext.js 15の互換性
- NextAuth v4とNext.js 15の互換性（NextAuth v5への移行が必要な可能性）
- Mantine UIとReact 19の互換性
- TipTapエディタとReact 19の互換性
