import { describe, expect, it, vi } from 'vitest';

import { FetchSongImageService } from './fetch-song-image.service';
import { type SpotifyApiService } from './spotify-api.service';

import type { MyBestSong } from '@/types/generated/zod';

const song = (overrides: Partial<MyBestSong>): MyBestSong => ({
  id: 'song-1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  userId: 'user-1',
  spotifyId: 'spotify-track-1',
  type: 'track',
  artist: 'アーティスト',
  name: '曲名',
  order: 0,
  ...overrides,
});

const createSpotifyMock = (overrides: Partial<Record<keyof SpotifyApiService, unknown>> = {}) =>
  ({
    setAccessToken: vi.fn().mockResolvedValue(undefined),
    getSeveralTracks: vi.fn().mockResolvedValue({
      tracks: [{ id: 'spotify-track-1', album: { images: [{ url: 'https://i.scdn.co/a.jpg' }] } }],
    }),
    getSeveralAlbums: vi.fn().mockResolvedValue({ albums: [] }),
    ...overrides,
  }) as unknown as SpotifyApiService;

describe('FetchSongImageService', () => {
  it('Spotify から取れたジャケット画像を曲に付ける', async () => {
    const service = new FetchSongImageService(createSpotifyMock());

    const result = await service.invoke([song({})]);

    expect(result).toEqual([expect.objectContaining({ image: 'https://i.scdn.co/a.jpg' })]);
  });

  it('Spotify ID の無い曲だけなら Spotify を呼ばずにそのまま返す', async () => {
    const setAccessToken = vi.fn();
    const service = new FetchSongImageService(createSpotifyMock({ setAccessToken }));
    const songs = [song({ spotifyId: '' })];

    const result = await service.invoke(songs);

    expect(result).toEqual(songs);
    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('Spotify のトークン取得に失敗しても、曲は画像なしで返す', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = new FetchSongImageService(
      createSpotifyMock({ setAccessToken: vi.fn().mockRejectedValue(new Error('401')) }),
    );
    const songs = [song({})];

    const result = await service.invoke(songs);

    expect(result).toEqual(songs);
  });

  it('Spotify の曲情報の取得に失敗しても、曲は画像なしで返す', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const service = new FetchSongImageService(
      createSpotifyMock({ getSeveralTracks: vi.fn().mockRejectedValue(new Error('503')) }),
    );
    const songs = [song({})];

    const result = await service.invoke(songs);

    expect(result).toEqual(songs);
  });
  // 実物の SpotifyApiService は失敗しても reject せず、中で握りつぶして undefined を返す
  it('Spotify の曲情報が取れず undefined が返っても、曲は画像なしで返す', async () => {
    const service = new FetchSongImageService(
      createSpotifyMock({ getSeveralTracks: vi.fn().mockResolvedValue(undefined) }),
    );
    const songs = [song({})];

    const result = await service.invoke(songs);

    expect(result).toEqual(songs);
  });

  it('Spotify のアルバム情報が取れず undefined が返っても、曲は画像なしで返す', async () => {
    const service = new FetchSongImageService(
      createSpotifyMock({ getSeveralAlbums: vi.fn().mockResolvedValue(undefined) }),
    );

    const result = await service.invoke([song({ type: 'album', spotifyId: 'spotify-album-1' })]);

    expect(result).toEqual([expect.objectContaining({ id: 'song-1', image: undefined })]);
  });
});
