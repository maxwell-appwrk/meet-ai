import { db } from '@/db'
import { agents, meetings, user, meetingGuests } from '@/db/schema'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/trpc/init'
import { z } from 'zod'
import { and, count, desc, eq, getTableColumns, ilike, inArray, sql } from 'drizzle-orm'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from '@/constants'
import { TRPCError } from '@trpc/server'
import { meetingInsertSchema, meetingUpdateSchema, guestJoinSchema } from '../schema'
import { MeetingStatus, StreamTranscriptItem } from '../types'
import { streamVideo } from '@/lib/stream-video'
import { generateAvatarUri } from '@/lib/avatar'
import JSONL from 'jsonl-parse-stringify'
import { streamChat } from '@/lib/stream-chat'
import { nanoid } from 'nanoid'

export const meetingsRouter = createTRPCRouter({
    generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {

        const token = streamChat.createToken(ctx.auth.user.id);
        await streamChat.upsertUser({
            id: ctx.auth.user.id,
            role: "admin"
        })

        return token;
    }),
    getTranscript: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const [existingMeeting] = await db.select({
            transcriptUrl: meetings.transcriptUrl
        }).from(meetings).where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
        ))

        if (!existingMeeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting not found"
            })
        }

        if (!existingMeeting.transcriptUrl) {
            return [];
        }

        const transcipt = await fetch(existingMeeting.transcriptUrl).then((res) => res.text()).then((text) => JSONL.parse<StreamTranscriptItem>(text)).catch((err) => {
            console.error(err);
            return [];
        });

        const speakerIds = [...new Set(transcipt.map(item => item.speaker_id))];

        const userSpeakers = await db.select().from(user).where(inArray(user.id, speakerIds)).then((users) => users.map((user) => ({
            ...user,
            image: user.image ?? generateAvatarUri({ seed: user.name, variant: "initials" })
        })));

        const agentSpeakers = await db.select().from(agents).where(inArray(agents.id, speakerIds)).then((agents) => agents.map((agent) => ({
            ...agent,
            image: generateAvatarUri({ seed: agent.name, variant: "botttsNeutral" })
        })));

        const speakers = [...userSpeakers, ...agentSpeakers];

        const transciptWithSpeakers = transcipt.map((item) => {
            const speaker = speakers.find((speaker) => speaker.id === item.speaker_id);

            if (!speaker) {
                return {
                    ...item,
                    user: {
                        name: "Unknown",
                        image: generateAvatarUri({ seed: "Unknown", variant: "initials" })
                    }
                };
            }

            return {
                ...item,
                user: {
                    name: speaker.name,
                    image: speaker.image
                }
            }
        });

        return transciptWithSpeakers;
    }),
    generateToken: protectedProcedure.mutation(async ({ ctx }) => {
        await streamVideo.upsertUsers([
            {
                id: ctx.auth.user.id,
                name: ctx.auth.user.name,
                role: "admin",
                image: ctx.auth.user.image ?? generateAvatarUri({ seed: ctx.auth.user.id, variant: "initials" }),
            }
        ])

        const expirationTime = Math.floor(Date.now() / 1000) + 3600;
        const issuedAt = Math.floor(Date.now() / 1000) - 60;
        const token = streamVideo.generateUserToken({ user_id: ctx.auth.user.id, exp: expirationTime, validity_in_seconds: issuedAt });

        return token;
    }),
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const [existingMeeting] = await db.select({
            ...getTableColumns(meetings),
            agent: agents,
            duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration")
        }).from(meetings).innerJoin(agents, eq(meetings.agentId, agents.id)).where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
        ))

        if (!existingMeeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting not found"
            })
        }

        return existingMeeting;
    }),
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
        agentId: z.string().nullish(),
        status: z.enum([MeetingStatus.Upcoming, MeetingStatus.Active, MeetingStatus.Completed, MeetingStatus.Cancelled, MeetingStatus.Processing]).nullish()
    })).query(async ({ ctx, input }) => {
        const { page, pageSize, search, agentId, status } = input;
        const data = await db.select({
            ...getTableColumns(meetings),
            agent: agents,
            duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration")
        }).from(meetings)
            .innerJoin(agents, eq(meetings.agentId, agents.id))
            .where(and(
                eq(meetings.userId, ctx.auth.user.id),
                search ? ilike(meetings.name, `%${search}%`) : undefined,
                agentId ? eq(meetings.agentId, agentId) : undefined,
                status ? eq(meetings.status, status) : undefined
            ))
            .orderBy(desc(meetings.createdAt), desc(meetings.id))
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        const [total] = await db.select({
            count: count()
        }).from(meetings)
            .innerJoin(agents, eq(meetings.agentId, agents.id))
            .where(and(
                eq(meetings.userId, ctx.auth.user.id),
                search ? ilike(meetings.name, `%${search}%`) : undefined,
                agentId ? eq(meetings.agentId, agentId) : undefined,
                status ? eq(meetings.status, status) : undefined
            ))

        const totalPages = Math.ceil(total.count / pageSize);

        return {
            items: data,
            totalItems: total.count,
            totalPages
        }
    }),
    create: protectedProcedure.input(meetingInsertSchema).mutation(async ({ input, ctx }) => {
        // Generate access token for public meetings
        const accessToken = input.isPublic ? nanoid(32) : null;

        const [createdMeeting] = await db.insert(meetings).values({
            ...input,
            userId: ctx.auth.user.id,
            accessToken,
        }).returning();

        const call = streamVideo.video.call("default", createdMeeting.id);
        await call.create({
            data: {
                created_by_id: ctx.auth.user.id,
                custom: {
                    meetingId: createdMeeting.id,
                    meetingName: createdMeeting.name,
                },
                settings_override: {
                    transcription: {
                        language: "en",
                        mode: "auto-on",
                        closed_caption_mode: "auto-on"
                    },
                    recording: {
                        mode: "auto-on",
                        quality: "1080p",
                    }
                }
            }
        }).catch((err) => {
            console.error(err);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create meeting"
            })
        })

        const [existingAgent] = await db.select().from(agents).where(eq(agents.id, createdMeeting.agentId));

        if (!existingAgent) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Agent not found"
            })
        }

        await streamVideo.upsertUsers([
            {
                id: existingAgent.id,
                name: existingAgent.name,
                role: "user",
                image: generateAvatarUri({ seed: existingAgent.name, variant: "botttsNeutral" }),
            }
        ])

        return createdMeeting;
    }),
    remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
        const [removedMeeting] = await db.delete(meetings).where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
        )).returning();

        if (!removedMeeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting not found"
            })
        }

        return removedMeeting;
    }),
    update: protectedProcedure.input(meetingUpdateSchema).mutation(async ({ input, ctx }) => {
        const [updatedMeeting] = await db.update(meetings).set(input).where(and(
            eq(meetings.id, input.id),
            eq(meetings.userId, ctx.auth.user.id)
        )).returning();

        if (!updatedMeeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting not found"
            })
        }

        return updatedMeeting;
    }),

    // Guest access procedures
    validateGuestAccess: publicProcedure.input(z.object({
        accessToken: z.string()
    })).query(async ({ input }) => {
        const [meeting] = await db.select({
            id: meetings.id,
            name: meetings.name,
            status: meetings.status,
            isPublic: meetings.isPublic,
            expiresAt: meetings.expiresAt,
            agent: agents,
        })
            .from(meetings)
            .innerJoin(agents, eq(meetings.agentId, agents.id))
            .where(eq(meetings.accessToken, input.accessToken));

        if (!meeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invalid meeting link"
            });
        }

        if (!meeting.isPublic) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "This meeting is not public"
            });
        }

        if (meeting.expiresAt && new Date(meeting.expiresAt) < new Date()) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "This meeting link has expired"
            });
        }

        if (meeting.status === MeetingStatus.Completed || meeting.status === MeetingStatus.Cancelled) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "This meeting has ended"
            });
        }

        return {
            meetingId: meeting.id,
            meetingName: meeting.name,
            agentName: meeting.agent.name,
            status: meeting.status
        };
    }),

    generateGuestToken: publicProcedure.input(guestJoinSchema).mutation(async ({ input }) => {
        // First validate the meeting
        const [meeting] = await db.select()
            .from(meetings)
            .where(eq(meetings.accessToken, input.accessToken));

        if (!meeting || !meeting.isPublic) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invalid meeting link"
            });
        }

        if (meeting.expiresAt && new Date(meeting.expiresAt) < new Date()) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "This meeting link has expired"
            });
        }

        // Generate guest user ID
        const guestId = `guest_${nanoid(10)}`;

        // Create guest record
        await db.insert(meetingGuests).values({
            meetingId: meeting.id,
            guestName: input.guestName,
            guestId: guestId,
        });

        // Create Stream Video user for guest
        await streamVideo.upsertUsers([{
            id: guestId,
            name: input.guestName,
            role: "user",
            image: generateAvatarUri({ seed: input.guestName, variant: "initials" }),
        }]);

        // Generate token with restricted access
        const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const issuedAt = Math.floor(Date.now() / 1000) - 60;
        const token = streamVideo.generateUserToken({
            user_id: guestId,
            exp: expirationTime,
            validity_in_seconds: issuedAt,
            call_cids: [`default:${meeting.id}`] // Restrict to specific call
        });

        return {
            token,
            guestId,
            meetingId: meeting.id,
        };
    }),

    getShareableLink: protectedProcedure.input(z.object({
        id: z.string()
    })).query(async ({ input, ctx }) => {
        const [meeting] = await db.select({
            id: meetings.id,
            isPublic: meetings.isPublic,
            accessToken: meetings.accessToken,
            expiresAt: meetings.expiresAt,
        })
            .from(meetings)
            .where(and(
                eq(meetings.id, input.id),
                eq(meetings.userId, ctx.auth.user.id)
            ));

        if (!meeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting not found"
            });
        }

        if (!meeting.isPublic || !meeting.accessToken) {
            return null;
        }

        // Construct the shareable link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const shareableLink = `${baseUrl}/join/${meeting.accessToken}`;

        return {
            link: shareableLink,
            expiresAt: meeting.expiresAt,
        };
    }),

    togglePublicAccess: protectedProcedure.input(z.object({
        id: z.string(),
        isPublic: z.boolean(),
        expiresAt: z.date().optional(),
    })).mutation(async ({ input, ctx }) => {
        const accessToken = input.isPublic ? nanoid(32) : null;

        const [updatedMeeting] = await db.update(meetings)
            .set({
                isPublic: input.isPublic,
                accessToken,
                expiresAt: input.expiresAt,
                updatedAt: new Date(),
            })
            .where(and(
                eq(meetings.id, input.id),
                eq(meetings.userId, ctx.auth.user.id)
            ))
            .returning();

        if (!updatedMeeting) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Meeting not found"
            });
        }

        return updatedMeeting;
    })
})