import { db } from '@/db'
import { agents, meetings } from '@/db/schema'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { MeetingStatus } from '@/modules/meetings/types'

export const homeRouter = createTRPCRouter({
    getDashboardData: protectedProcedure.query(async ({ ctx }) => {
        // Fetch recent meetings with agent info
        const recentMeetingsData = await db.select({
            id: meetings.id,
            name: meetings.name,
            status: meetings.status,
            createdAt: meetings.createdAt,
            startedAt: meetings.startedAt,
            endedAt: meetings.endedAt,
            summary: meetings.summary,
            duration: sql<number>`EXTRACT(EPOCH FROM (${meetings.endedAt} - ${meetings.startedAt}))`.as("duration"),
            agent: {
                id: agents.id,
                name: agents.name,
            }
        })
        .from(meetings)
        .innerJoin(agents, eq(meetings.agentId, agents.id))
        .where(eq(meetings.userId, ctx.auth.user.id))
        .orderBy(desc(meetings.createdAt))
        .limit(4);

        // Map status to MeetingStatus enum
        const recentMeetings = recentMeetingsData.map(meeting => ({
            ...meeting,
            status: meeting.status as MeetingStatus
        }));

        // Fetch recent agents with meeting counts
        const recentAgents = await db.select({
            id: agents.id,
            name: agents.name,
            instructions: agents.instructions,
            meetingCount: count(meetings.id),
        })
        .from(agents)
        .leftJoin(meetings, eq(agents.id, meetings.agentId))
        .where(eq(agents.userId, ctx.auth.user.id))
        .groupBy(agents.id)
        .orderBy(desc(agents.createdAt))
        .limit(3);

        // Fetch statistics
        const [totalMeetingsResult] = await db.select({
            count: count()
        })
        .from(meetings)
        .where(eq(meetings.userId, ctx.auth.user.id));

        const [completedMeetingsResult] = await db.select({
            count: count()
        })
        .from(meetings)
        .where(and(
            eq(meetings.userId, ctx.auth.user.id),
            eq(meetings.status, MeetingStatus.Completed)
        ));

        const [totalAgentsResult] = await db.select({
            count: count()
        })
        .from(agents)
        .where(eq(agents.userId, ctx.auth.user.id));

        return {
            recentMeetings,
            recentAgents,
            stats: {
                totalMeetings: totalMeetingsResult?.count || 0,
                completedMeetings: completedMeetingsResult?.count || 0,
                totalAgents: totalAgentsResult?.count || 0,
            }
        };
    }),
});