/** 全角・半角と大文字・小文字の違いを同じアーティストとみなすためのキー。サーバーの集計と画面の照合の両方で使う */
export const artistKey = (artist: string) => artist.normalize('NFKC').trim().toLowerCase();
