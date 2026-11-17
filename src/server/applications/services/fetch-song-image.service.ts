import split from 'just-split';

import { SpotifyApiService } from '@/server/applications/services/spotify-api.service';
import { type MyBestSong } from '@/types/generated/zod';
import { type SongWithImage } from '@/types/types';

export class FetchSongImageService {
  constructor(private readonly spotifyApiService: SpotifyApiService = new SpotifyApiService()) {}

  public async invoke(songs: MyBestSong[]): Promise<SongWithImage[]> {
    if (songs.length === 0) return [];

    const { albumIdsChunks, trackIds } = FetchSongImageService.convertToSpotifyIds(songs);

    // If no valid spotifyIds exist, return songs without images
    const hasValidIds = trackIds.length > 0 || albumIdsChunks.some((chunk) => chunk.length > 0);
    if (!hasValidIds) return songs;

    // ジャケット画像は飾りなので、Spotify が落ちていても曲の一覧は返す
    const images = await this.fetchSongImages(trackIds, albumIdsChunks).catch((error: unknown) => {
      console.error('Spotify からジャケット画像を取得できませんでした', error);
      return null;
    });
    if (!images) return songs;
    const { tracks, albums } = images;

    return songs.map((song) => {
      if (song.type === 'track') {
        if (!tracks) return song;
        const foundTrack = tracks.find((t) => t.id === song.spotifyId);
        return {
          ...song,
          image: foundTrack?.album.images[0]?.url,
        };
      }

      if (!albums) return song;
      const foundAlbum = albums.find((album) => album?.id === song.spotifyId);
      return {
        ...song,
        image: foundAlbum?.images[0]?.url,
      };
    });
  }

  private static convertToSpotifyIds(songs: Array<Pick<MyBestSong, 'spotifyId' | 'type'>>) {
    const albumIds = songs
      .filter((song) => song.type === 'album' && song.spotifyId)
      .map((song) => song.spotifyId);
    const albumIdsChunks = split(albumIds, 20); // albumsの取得は20件ずつに分割して取得しないといけないので
    const trackIds = songs
      .filter((song) => song.type === 'track' && song.spotifyId)
      .map((song) => song.spotifyId);

    return { albumIdsChunks, trackIds };
  }

  private async fetchSongImages(trackIds: string[], albumIdsChunks: string[][]) {
    await this.spotifyApiService.setAccessToken();

    const validAlbumChunks = albumIdsChunks.filter((ids) => ids.length > 0);

    const [tracks, ...albums] = await Promise.all([
      trackIds.length > 0 ? this.spotifyApiService.getSeveralTracks(trackIds) : undefined,
      ...validAlbumChunks.map((ids) => this.spotifyApiService.getSeveralAlbums(ids)),
    ]);

    // albumsのデータを1次元の配列にまとめる
    const groupedAlbums = albums
      ?.map((album) => album?.albums)
      .filter(Boolean)
      .flat();

    return {
      tracks: tracks?.tracks,
      albums: groupedAlbums,
    };
  }
}
