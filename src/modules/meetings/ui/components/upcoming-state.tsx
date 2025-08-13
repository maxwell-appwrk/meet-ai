import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import Link from "next/link";

interface Props {
    meetingId: string;
}

export const UpcomingState = ({ meetingId }: Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 gap-y-6 flex flex-col items-center justify-between">
            <EmptyState
                title="Not started yet"
                description="Your meeting is not started yet."
                image="/upcoming.svg"
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
                <Button asChild className="w-full lg:w-auto">
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon />
                        Start Meeting
                    </Link>
                </Button>
            </div>
        </div>
    );
};