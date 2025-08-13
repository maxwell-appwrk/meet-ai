"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareIcon, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { RecentAgent } from "../../types";

interface AgentCardProps {
    agent: RecentAgent;
}

export const AgentCard = ({ agent }: AgentCardProps) => {
    const router = useRouter();

    return (
        <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/agents/${agent.id}`)}
        >
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <SparklesIcon className="size-4 text-primary" />
                    {agent.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquareIcon className="size-3" />
                    {agent.meetingCount} {agent.meetingCount === 1 ? 'meeting' : 'meetings'}
                </div>
            </CardContent>
        </Card>
    );
};