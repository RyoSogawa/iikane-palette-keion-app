import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        nickname: true,
        UserPart: {
          select: {
            id: true,
            part: true,
          },
        },
        introduction: true,
        image: true,
      },
    });
  }),
  findById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
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
  }),
});
