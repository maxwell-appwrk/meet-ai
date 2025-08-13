import { createTRPCRouter } from '../init';
import { agentsRouter } from '@/modules/agents/server/procedures';
import { meetingsRouter } from '@/modules/meetings/server/procedures';
import { homeRouter } from '@/modules/home/server/procedures';

export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  meetings: meetingsRouter,
  home: homeRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;