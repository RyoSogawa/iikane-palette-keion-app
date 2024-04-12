import { z } from 'zod';

export const musicTypeSchema = z.enum(['track', 'album']);
export type MusicType = z.infer<typeof musicTypeSchema>;
