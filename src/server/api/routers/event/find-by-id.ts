import { z } from 'zod';

import { eventDetailSelect } from '@/server/api/routers/event/event-detail-select';
import { publishedEventWhere } from '@/server/api/routers/event/published';
import { publicProcedure } from '@/server/api/trpc';

const inputSchema = z.object({ id: z.string() });

export const findById = publicProcedure.input(inputSchema).query(({ ctx, input }) => {
  return ctx.db.event.findFirst({
    where: {
      id: input.id,
      ...publishedEventWhere,
    },
    select: eventDetailSelect,
  });
});
