import { z } from 'zod';

import { eventDetailSelect } from '@/server/api/routers/event/event-detail-select';
import { adminProcedure } from '@/server/api/trpc';

export const findById = adminProcedure
  .input(z.object({ id: z.string() }))
  .query(({ ctx, input }) => {
    return ctx.db.event.findUnique({
      where: { id: input.id },
      select: {
        ...eventDetailSelect,
        isDraft: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
