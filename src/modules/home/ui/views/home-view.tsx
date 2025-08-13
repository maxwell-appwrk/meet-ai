"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { MeetingCard } from "../components/meeting-card";
import { AgentCard } from "../components/agent-card";
import { StatsCard } from "../components/stats-card";
import { QuickActionCards } from "../components/quick-action-cards";

const HomeView = () => {
    const router = useRouter();
    const trpc = useTRPC();

    // Fetch dashboard data using the home module procedure
    const { data } = useSuspenseQuery(trpc.home.getDashboardData.queryOptions());

    const { recentMeetings, recentAgents, stats } = data;

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-6">
            {/* Welcome Section */}
            <div className="pt-6">
                <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your AI-powered meetings and agents from your dashboard
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <QuickActionCards />
                <StatsCard stats={stats} />
            </div>

            {/* Recent Meetings */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Meetings</h2>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push("/meetings")}
                    >
                        View all
                        <ArrowRightIcon className="size-4 ml-2" />
                    </Button>
                </div>

                {recentMeetings.length === 0 ? (
                    <EmptyState 
                        title="No meetings yet" 
                        description="Create your first meeting to get started"
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {recentMeetings.map((meeting) => (
                            <MeetingCard key={meeting.id} meeting={meeting} />
                        ))}
                    </div>
                )}
            </div>

            {/* AI Agents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your AI Agents</h2>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push("/agents")}
                    >
                        Manage agents
                        <ArrowRightIcon className="size-4 ml-2" />
                    </Button>
                </div>

                {recentAgents.length === 0 ? (
                    <EmptyState 
                        title="No agents yet" 
                        description="Create your first AI agent to start meetings"
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                        {recentAgents.map((agent) => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export const HomeViewLoadingState = () => {
    return <LoadingState title="Loading dashboard" description="This may take a few seconds" />;
}

export const HomeViewErrorState = () => {
    return <ErrorState title="Failed to load dashboard" description="Please try again later." />
}

export default HomeView;