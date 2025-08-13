import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type DashboardData = RouterOutputs["home"]["getDashboardData"];
export type DashboardStats = DashboardData["stats"];
export type RecentMeeting = DashboardData["recentMeetings"][number];
export type RecentAgent = DashboardData["recentAgents"][number];