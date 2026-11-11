import { createTRPCRouter } from '@/server/api/trpc';

import { board } from './board';
import { createSong } from './create-song';
import { deleteSong } from './delete-song';
import { join } from './join';
import { leave } from './leave';
import { setMyParts } from './set-my-parts';
import { setPlayed } from './set-played';

/** セッションページの API。認証の Session と混ざらないよう jamSession と呼ぶ */
export const jamSessionRouter = createTRPCRouter({
  board,
  join,
  leave,
  createSong,
  deleteSong,
  setMyParts,
  setPlayed,
});
