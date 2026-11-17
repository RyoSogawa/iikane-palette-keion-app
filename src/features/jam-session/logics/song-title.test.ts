import { describe, expect, it } from 'vitest';

import { songSubtitle, songTitle } from './song-title';

describe('曲の表示名', () => {
  it('曲名があれば曲名、アーティスト名は副題', () => {
    const song = { name: 'Wonderwall', artist: 'Oasis' };
    expect(songTitle(song)).toBe('Wonderwall');
    expect(songSubtitle(song)).toBe('Oasis');
  });

  it('曲名が無ければ「<アーティスト名> の曲なにか」で、副題は出さない', () => {
    const song = { name: null, artist: 'Oasis' };
    expect(songTitle(song)).toBe('Oasis の曲なにか');
    expect(songSubtitle(song)).toBeNull();
  });

  it('アーティスト名が無ければ曲名だけ', () => {
    const song = { name: 'ブルースセッション', artist: null };
    expect(songTitle(song)).toBe('ブルースセッション');
    expect(songSubtitle(song)).toBeNull();
  });
});
