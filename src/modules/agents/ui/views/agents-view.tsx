"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const AgentsView = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    return (
        <div>{JSON.stringify(data, null, 2)}</div>
    )
}

export const AgentsViewLoadingState = () => {
    return <LoadingState title="Loading agents" description="This may take a few seconds" />;
}

export const AgentsViewErrorState = () => {
    return <ErrorState title="Failed to load agents" description="Please try again later." />
}



export default AgentsView;