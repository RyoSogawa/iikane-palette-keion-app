import { describe, expect, it } from 'vitest';

import { songSearchUrl } from './search-links';

const queryOf = (url: string) => new URL(url).searchParams.get('q');

describe('songSearchUrl', () => {
  it('曲名とアーティスト名に「コード」を付けて Google で検索する', () => {
    const url = songSearchUrl({ name: 'Wonderwall', artist: 'Oasis' }, 'chord');

    expect(url.startsWith('https://www.google.com/search?')).toBe(true);
    expect(queryOf(url)).toBe('Wonderwall Oasis コード');
  });

  it('歌詞は「歌詞」を付けて検索する', () => {
    expect(queryOf(songSearchUrl({ name: 'Wonderwall', artist: 'Oasis' }, 'lyrics'))).toBe(
      'Wonderwall Oasis 歌詞',
    );
  });

  it('曲名が無ければアーティスト名だけで検索する', () => {
    expect(queryOf(songSearchUrl({ name: null, artist: 'Oasis' }, 'chord'))).toBe('Oasis コード');
  });

  it('記号を含む曲名も壊さずに渡す', () => {
    expect(queryOf(songSearchUrl({ name: 'Rock & Roll #1?', artist: null }, 'lyrics'))).toBe(
      'Rock & Roll #1? 歌詞',
    );
  });
});
