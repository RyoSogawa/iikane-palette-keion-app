// セッションの日付は DB の date 型（UTC の 0 時）で持ち、画面とは YYYY-MM-DD でやりとりする。
// サーバー（UTC）とブラウザで同じ値を描画しないとハイドレーションがずれるので、実行環境のタイムゾーンは使わない
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const HELD_ON_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const toHeldOn = (value: string) => new Date(`${value}T00:00:00.000Z`);

export const fromHeldOn = (date: Date) => date.toISOString().slice(0, 10);

export const todayInJst = (now: Date) =>
  new Date(now.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);

export const formatHeldOn = (date: Date) =>
  `${fromHeldOn(date).replace(/-/g, '/')}（${WEEKDAYS[date.getUTCDay()]}）`;
