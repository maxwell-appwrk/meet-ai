"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import humanizeDuration from "humanize-duration";
import type { RecentMeeting } from "../../types";
import { MeetingStatusBadge } from "./meeting-status-badge";

interface MeetingCardProps {
    meeting: RecentMeeting;
}

export const MeetingCard = ({ meeting }: MeetingCardProps) => {
    const router = useRouter();

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/meetings/${meeting.id}`)}
        >
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base">
                            {meeting.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <UsersIcon className="size-3" />
                            {meeting.agent.name}
                        </CardDescription>
                    </div>
                    <MeetingStatusBadge status={meeting.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {format(new Date(meeting.createdAt), "MMM d, yyyy")}
                    </span>
                    {meeting.duration && (
                        <span className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {humanizeDuration(Math.round(meeting.duration) * 1000, {
                                largest: 1,
                                round: true
                            })}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};