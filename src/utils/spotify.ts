import { z } from 'zod';

import { env } from '@/env';

const SpotifyAccessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export class SpotifyApi {
  private static readonly baseUrl = 'https://api.spotify.com/v1';

  private accessToken = '';

  private async setSpotifyAccessToken() {
    const url = 'https://accounts.spotify.com/api/token';
    const key = Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString(
      'base64',
    );

    const headers = new Headers();
    headers.append('Authorization', `Basic ${key}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: unknown = await response.json();
      this.accessToken = SpotifyAccessTokenSchema.parse(data).access_token;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  public async search(
    params: SpotifyApi.SearchForItemParameterObject,
  ): Promise<(SpotifyApi.TrackSearchResponse & SpotifyApi.AlbumSearchResponse) | void> {
    if (!this.accessToken) {
      await this.setSpotifyAccessToken();
    }

    const url = `${SpotifyApi.baseUrl}/search`;
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
    );

    try {
      const response = await fetch(`${url}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as SpotifyApi.TrackSearchResponse &
        SpotifyApi.AlbumSearchResponse;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }
}
