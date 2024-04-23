import { z } from 'zod';

import { MyBestSongSchema } from '@/types/generated/zod';

export const SongWithImageSchema = z.intersection(
  MyBestSongSchema,
  z.object({
    image: z.string().optional(),
  }),
);

export type SongWithImage = z.infer<typeof SongWithImageSchema>;
