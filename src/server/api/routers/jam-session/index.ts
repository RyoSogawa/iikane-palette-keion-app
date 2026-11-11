import { createTRPCRouter } from '@/server/api/trpc';

import { board } from './board';
import { createSong } from './create-song';
import { deleteSong } from './delete-song';
import { join } from './join';
import { leave } from './leave';
import { create, deleteSession, list, update } from './sessions';
import { setMyParts } from './set-my-parts';
import { setPlayed } from './set-played';
import { sharedArtists } from './shared-artists-procedure';

/** セッションページの API。認証の Session と混ざらないよう jamSession と呼ぶ。ボードはセッション（当日の会）ごと */
export const jamSessionRouter = createTRPCRouter({
  list,
  create,
  update,
  delete: deleteSession,
  board,
  join,
  leave,
  createSong,
  deleteSong,
  setMyParts,
  setPlayed,
  sharedArtists,
});
