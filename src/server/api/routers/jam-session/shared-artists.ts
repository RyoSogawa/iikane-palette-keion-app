export type SharedArtist = { artist: string; userIds: string[] };

const DEFAULT_LIMIT = 10;

/** 全角・半角と大文字・小文字の違いを同じアーティストとみなすためのキー。画面の照合でも使う */
export const artistKey = (artist: string) => artist.normalize('NFKC').trim().toLowerCase();

/**
 * 2 人以上が My Best Songs に登録しているアーティストを、人数の多い順に返す。
 * 複数アーティストの曲は "A, B" とつないだ文字列で入っているが、"Earth, Wind & Fire" のような名前を
 * 壊してしまうので、カンマでは分けずにそのままの表記で数える。
 */
export const findSharedArtists = (
  songs: ReadonlyArray<{ userId: string; artist: string }>,
  limit = DEFAULT_LIMIT,
): SharedArtist[] => {
  // 参加者全員の曲を毎回なめるので、コピーを重ねず関数の中だけの Map に詰める
  const byKey = new Map<string, { artist: string; userIds: Set<string> }>();
  for (const { userId, artist } of songs) {
    const key = artistKey(artist);
    if (key === '') continue;
    const entry = byKey.get(key) ?? { artist: artist.trim(), userIds: new Set<string>() };
    entry.userIds.add(userId);
    byKey.set(key, entry);
  }

  return [...byKey.values()]
    .map(({ artist, userIds }) => ({ artist, userIds: [...userIds] }))
    .filter(({ userIds }) => userIds.length >= 2)
    .sort((a, b) => b.userIds.length - a.userIds.length || a.artist.localeCompare(b.artist, 'ja'))
    .slice(0, limit);
};
