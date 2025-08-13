import { auth } from "@/lib/auth";
import CallView from "@/modules/call/ui/views/call-view";
import GuestCallView from "@/modules/call/ui/views/guest-call-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";

interface Props {
    params: Promise<{ meetingId: string }>
}

const page = async ({ params }: Props) => {
    const { meetingId } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    })

    const queryClient = getQueryClient();

    // If authenticated user, render normal call view
    if (session) {
        void queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

        return (
            <HydrationBoundary state={dehydrate(queryClient)}>
                <CallView meetingId={meetingId} />
            </HydrationBoundary>
        )
    }

    // For non-authenticated users, render guest call view
    // Guest authentication is handled client-side with session storage
    return <GuestCallView meetingId={meetingId} />;
}

export default page;