type SongNames = { name: string | null; artist: string | null };

const KEYWORDS = { chord: 'コード', lyrics: '歌詞' } as const;

export type SongSearchKind = keyof typeof KEYWORDS;

/**
 * 曲のコード譜・歌詞を探す Google 検索の URL。
 * 特定のコード譜・歌詞サイトに自動でアクセスすると相手の利用規約の確認が要るので、検索結果へのリンクに留める。
 */
export const songSearchUrl = ({ name, artist }: SongNames, kind: SongSearchKind) => {
  const q = [name, artist, KEYWORDS[kind]].filter(Boolean).join(' ');
  return `https://www.google.com/search?${new URLSearchParams({ q }).toString()}`;
};
