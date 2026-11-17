import { describe, expect, it } from 'vitest';

import { findSharedArtists } from './shared-artists';

const song = (userId: string, artist: string) => ({ userId, artist });

describe('findSharedArtists', () => {
  it('2 人以上が登録しているアーティストだけを、人数の多い順に返す', () => {
    const result = findSharedArtists([
      song('a', 'Oasis'),
      song('b', 'Oasis'),
      song('c', 'Oasis'),
      song('a', '椎名林檎'),
      song('b', '椎名林檎'),
      song('c', 'Blur'),
    ]);

    expect(result).toEqual([
      { artist: 'Oasis', userIds: ['a', 'b', 'c'] },
      { artist: '椎名林檎', userIds: ['a', 'b'] },
    ]);
  });

  it('同じ人が同じアーティストを何曲登録していても 1 人と数える', () => {
    expect(findSharedArtists([song('a', 'Oasis'), song('a', 'Oasis')])).toEqual([]);
  });

  it('大文字と小文字、前後の空白の違いは同じアーティストとみなし、最初に出てきた表記で返す', () => {
    expect(findSharedArtists([song('a', 'oasis '), song('b', 'Oasis')])).toEqual([
      { artist: 'oasis', userIds: ['a', 'b'] },
    ]);
  });

  it('全角と半角の違いも同じアーティストとみなす', () => {
    expect(findSharedArtists([song('a', 'ＯＡＳＩＳ'), song('b', 'Oasis')])).toEqual([
      { artist: 'ＯＡＳＩＳ', userIds: ['a', 'b'] },
    ]);
  });

  it('アーティスト名が空の曲は数えない', () => {
    expect(findSharedArtists([song('a', ''), song('b', ' ')])).toEqual([]);
  });

  it('複数アーティストの曲はカンマで分けず、そのままの表記で数える', () => {
    expect(
      findSharedArtists([song('a', 'Earth, Wind & Fire'), song('b', 'Earth, Wind & Fire')]),
    ).toEqual([{ artist: 'Earth, Wind & Fire', userIds: ['a', 'b'] }]);
  });

  it('上限の件数までに絞る', () => {
    const songs = ['A', 'B', 'C'].flatMap((artist) => [song('a', artist), song('b', artist)]);
    expect(findSharedArtists(songs, 2)).toHaveLength(2);
  });
});
