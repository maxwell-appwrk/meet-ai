import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";
import type { DashboardStats } from "../../types";

interface StatsCardProps {
    stats: DashboardStats;
}

export const StatsCard = ({ stats }: StatsCardProps) => {
    return (
        <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="size-5" />
                    Quick Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-2xl font-semibold">{stats.totalMeetings}</p>
                    <p className="text-xs text-muted-foreground">Total Meetings</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-semibold">{stats.completedMeetings}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-semibold">{stats.totalAgents}</p>
                    <p className="text-xs text-muted-foreground">AI Agents</p>
                </div>
            </CardContent>
        </Card>
    );
};