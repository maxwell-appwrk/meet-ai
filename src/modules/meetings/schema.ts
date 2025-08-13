import { z } from "zod";

export const meetingInsertSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    agentId: z.string().min(1, { message: "Agent ID is required" }),
    isPublic: z.boolean(),
    expiresAt: z.date().optional(),
})

export const meetingUpdateSchema = meetingInsertSchema.extend({
    id: z.string().min(1, { message: "Meeting ID is required" })
})

export const guestJoinSchema = z.object({
    accessToken: z.string().min(1, { message: "Access token is required" }),
    guestName: z.string().min(1, { message: "Name is required" }).max(50, { message: "Name is too long" })
})
