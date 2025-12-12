# Design: Next.js 15 / React 19 アップグレード

## Context
現在のプロジェクトはNext.js 14.1.0とReact 18.2.0を使用している。
Next.js 15とReact 19は2024年後半にリリースされ、多くの新機能と改善が含まれている。

### 現在のバージョン
| パッケージ | 現在 | 目標 |
|-----------|------|------|
| next | 14.1.0 | 15.x |
| react | 18.2.0 | 19.x |
| react-dom | 18.2.0 | 19.x |

## Goals / Non-Goals

### Goals
- Next.js 15の最新安定版への移行
- React 19の最新安定版への移行
- 既存機能の動作を維持
- ビルド・開発環境の正常動作を確保

### Non-Goals
- NextAuth v4 → v5への移行（必要な場合のみ実施）
- 新機能（React Compiler、Server Actions等）の積極的活用
- パフォーマンスチューニング

## Decisions

### 1. 段階的アップグレード
**決定**: Next.jsとReactを同時にアップグレードする

**理由**: Next.js 15はReact 19を前提としているため、個別のアップグレードは現実的でない

### 2. 関連パッケージの対応方針
**決定**: 互換性のある最新バージョンに更新、非互換の場合は代替手段を検討

**優先順位**:
1. tRPC - API層の根幹
2. NextAuth - 認証の根幹
3. Mantine UI - UI全体に影響
4. その他（TanStack Query, dnd-kit, TipTap等）

## Risks / Trade-offs

### High Risk
- **NextAuth v4との互換性**: Next.js 15でNextAuth v4が動作しない可能性
  - 軽減策: 公式ドキュメントとGitHub issuesを確認、必要ならv5移行を検討

### Medium Risk
- **tRPCとの互換性**: App Router + tRPCの組み合わせで問題が発生する可能性
  - 軽減策: tRPCの最新バージョンを使用

- **Mantine UIの互換性**: React 19のStrictModeでの動作
  - 軽減策: Mantine v7の最新パッチを適用

### Low Risk
- **TypeScript型定義の不整合**
  - 軽減策: @types/reactを最新に更新

## Migration Plan

### Step 1: パッケージ更新
```bash
pnpm add next@latest react@latest react-dom@latest
pnpm add -D @types/react@latest @types/react-dom@latest eslint-config-next@latest
```

### Step 2: 互換性確認
1. `pnpm install` でエラーがないか確認
2. `pnpm build` でビルドエラーを確認
3. エラーに応じて関連パッケージを更新

### Step 3: コード修正
- 非推奨警告への対応
- 破壊的変更への対応

### Rollback
問題が発生した場合、`git checkout -- package.json pnpm-lock.yaml` で元に戻す

## Open Questions
- NextAuth v5への移行は今回のスコープに含めるか？
- React Compilerの有効化は検討するか？
