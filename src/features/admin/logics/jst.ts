// サーバー（UTC）とブラウザで同じ値を描画しないとハイドレーションがずれるので、実行環境のタイムゾーンは使わない。
// 日本の部活のサイトなので JST に固定する（夏時間がないのでオフセットは常に +9 時間）
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

const toJstIsoString = (date: Date) => new Date(date.getTime() + JST_OFFSET_MS).toISOString();

/** <input type="datetime-local"> に入れる値にする */
export const toDateTimeLocal = (date: Date) => toJstIsoString(date).slice(0, 16);

/** <input type="datetime-local"> の値を JST として Date に戻す。入力が無いか不正なら null */
export const fromDateTimeLocal = (value: string) => {
  if (!DATETIME_LOCAL_PATTERN.test(value)) return null;
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${withSeconds}+09:00`);
  // 2026-13-40 のような値は Date が繰り上げて受け付けてしまうので、元の文字列に戻るかで確かめる
  if (Number.isNaN(date.getTime()) || toJstIsoString(date).slice(0, 19) !== withSeconds) {
    return null;
  }
  return date;
};

/** 管理画面の一覧などに出す日時。yyyy/MM/dd HH:mm（JST） */
export const formatJst = (date: Date) =>
  toJstIsoString(date).slice(0, 16).replace('T', ' ').replace(/-/g, '/');
