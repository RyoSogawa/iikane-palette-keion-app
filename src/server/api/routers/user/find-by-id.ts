import { z } from 'zod';

import { publicProcedure } from '@/server/api/trpc';

const inputSchema = z.object({ id: z.string() });

export const findById = publicProcedure.input(inputSchema).query(({ ctx, input }) => {
  return ctx.db.user.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      name: true,
      nickname: true,
      UserPart: {
        select: {
          id: true,
          part: true,
          order: true,
          detail: true,
          remark: true,
          experience: true,
        },
      },
      introduction: true,
      image: true,
    },
  });
});
