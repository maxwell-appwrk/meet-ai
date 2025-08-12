"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import MeetingIdViewHeader from "../components/meeting-id-view-header";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import UpdateMeetingDialog from "../components/update-meeting-dialog";
import { useState } from "react";
import { MeetingStatus } from "../../types";
import { UpcomingState } from "../components/upcoming-state";
import { ActiveState } from "../components/active-state";
import { ProcessingState } from "../components/processing-state";
import { CancelledState } from "../components/cancelled-state";
import CompletedState from "../components/completed-state";

interface Props {
    meetingId: string
}

const MeetingIdView = ({ meetingId }: Props) => {
    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));
    const removeMeeting = useMutation(trpc.meetings.remove.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            router.push("/meetings");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }))

    const [RemoveConfirmation, confirmRemove] = useConfirm({
        title: "Are you sure?",
        description: "Are you sure you want to remove this meeting? This action cannot be undone."
    })

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();
        if (!ok) return;
        await removeMeeting.mutateAsync({ id: meetingId });
    }

    const isActive = data.status === MeetingStatus.Active;
    const isUpcoming = data.status === MeetingStatus.Upcoming;
    const isCompleted = data.status === MeetingStatus.Completed;
    const isCancelled = data.status === MeetingStatus.Cancelled;
    const isProcessing = data.status === MeetingStatus.Processing;
    
    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog open={updateMeetingDialogOpen} onOpenChange={setUpdateMeetingDialogOpen} initialValues={data} />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <MeetingIdViewHeader meetingId={meetingId} meetingName={data.name} onEdit={() => setUpdateMeetingDialogOpen(true)} onRemove={handleRemoveMeeting} />
                {isCancelled && <CancelledState />}
                {isActive && <ActiveState meetingId={meetingId} />}
                {isUpcoming && <UpcomingState meetingId={meetingId} onCancelMeeting={() => {}} isCancelling={false} />}
                {isCompleted && <CompletedState data={data} />}
                {isProcessing && <ProcessingState />}
            </div>
        </>
    )
}

export const MeetingIdViewLoadingState = () => {
    return <LoadingState title="Loading meeting" description="This may take a few seconds" />;
}

export const MeetingIdViewErrorState = () => {
    return <ErrorState title="Failed to load meeting" description="Please try again later." />
}



export default MeetingIdView
