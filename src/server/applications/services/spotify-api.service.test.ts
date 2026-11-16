import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpotifyApiService } from './spotify-api.service';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const okJson = (body: unknown) => ({ ok: true, json: () => Promise.resolve(body) });
const TOKEN = { access_token: 'token', token_type: 'Bearer', expires_in: 3600 };

describe('SpotifyApiService', () => {
  it('トークン取得と曲の取得のどちらの通信にも、打ち切りのための signal を付ける', async () => {
    fetchMock.mockResolvedValueOnce(okJson(TOKEN)).mockResolvedValueOnce(okJson({ tracks: [] }));

    await new SpotifyApiService().getSeveralTracks(['track-1']);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchMock.mock.calls as [string, RequestInit][]) {
      expect(init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it('通信が打ち切られたら、例外を投げずに undefined を返す', async () => {
    fetchMock
      .mockResolvedValueOnce(okJson(TOKEN))
      .mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'));

    await expect(new SpotifyApiService().getSeveralAlbums(['album-1'])).resolves.toBeUndefined();
  });
});
