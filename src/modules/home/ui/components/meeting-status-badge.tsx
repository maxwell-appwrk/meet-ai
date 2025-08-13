import { cn } from "@/lib/utils";
import { MeetingStatus } from "@/modules/meetings/types";
import { 
    ClockArrowUpIcon, 
    LoaderIcon, 
    CircleCheckIcon, 
    CircleXIcon 
} from "lucide-react";

interface MeetingStatusBadgeProps {
    status: MeetingStatus;
}

export const MeetingStatusBadge = ({ status }: MeetingStatusBadgeProps) => {
    const statusIconMap = {
        [MeetingStatus.Upcoming]: ClockArrowUpIcon,
        [MeetingStatus.Active]: LoaderIcon,
        [MeetingStatus.Completed]: CircleCheckIcon,
        [MeetingStatus.Processing]: LoaderIcon,
        [MeetingStatus.Cancelled]: CircleXIcon
    };

    const statusColorMap = {
        [MeetingStatus.Upcoming]: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
        [MeetingStatus.Active]: "bg-blue-500/20 text-blue-800 border-blue-800/5",
        [MeetingStatus.Completed]: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
        [MeetingStatus.Cancelled]: "bg-rose-500/20 text-rose-800 border-rose-800/5",
        [MeetingStatus.Processing]: "bg-gray-300/20 text-gray-800 border-gray-800/5"
    };

    const Icon = statusIconMap[status];
    const isAnimated = status === MeetingStatus.Active || status === MeetingStatus.Processing;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border capitalize",
            statusColorMap[status]
        )}>
            <Icon className={cn(
                "size-3.5",
                isAnimated && "animate-spin"
            )} />
            {status}
        </span>
    );
};