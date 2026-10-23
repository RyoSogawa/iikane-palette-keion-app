import { type AvatarStorageService, isDiscordCdnUrl } from './avatar-storage.service';

type UpdateUserImage = (userId: string, image: string) => Promise<unknown>;

/**
 * User.image が Discord の CDN を指していたら、画像を Supabase Storage にコピーして
 * User.image をコピー先の URL に書き換える。サインアップ時と既存ユーザーの移行で使う。
 */
export class ImportDiscordAvatarService {
  constructor(
    private readonly avatarStorage: AvatarStorageService,
    private readonly updateUserImage: UpdateUserImage,
  ) {}

  /** コピーしたときはコピー先の URL を、対象外のときは null を返す */
  public async invoke(user: { id: string; image: string | null }): Promise<string | null> {
    if (!isDiscordCdnUrl(user.image)) return null;

    const imagePath = await this.avatarStorage.copyFromDiscord(user.id, user.image);
    await this.updateUserImage(user.id, imagePath);
    return imagePath;
  }
}
