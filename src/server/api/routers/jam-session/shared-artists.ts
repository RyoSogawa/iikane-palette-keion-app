export type SharedArtist = { artist: string; userIds: string[] };

const DEFAULT_LIMIT = 10;

/**
 * 2 人以上が My Best Songs に登録しているアーティストを、人数の多い順に返す。
 * 複数アーティストの曲は "A, B" とつないだ文字列で入っているが、"Earth, Wind & Fire" のような名前を
 * 壊してしまうので、カンマでは分けずにそのままの表記で数える。
 */
export const findSharedArtists = (
  songs: ReadonlyArray<{ userId: string; artist: string }>,
  limit = DEFAULT_LIMIT,
): SharedArtist[] => {
  const byKey = songs.reduce((acc, { userId, artist }) => {
    const name = artist.trim();
    if (name === '') return acc;
    const key = name.toLowerCase();
    const current = acc.get(key) ?? { artist: name, userIds: [] };
    if (current.userIds.includes(userId)) return acc;
    return new Map(acc).set(key, { ...current, userIds: [...current.userIds, userId] });
  }, new Map<string, SharedArtist>());

  return [...byKey.values()]
    .filter(({ userIds }) => userIds.length >= 2)
    .sort((a, b) => b.userIds.length - a.userIds.length || a.artist.localeCompare(b.artist, 'ja'))
    .slice(0, limit);
};
