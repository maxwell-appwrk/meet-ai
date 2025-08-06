"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";

const AgentsView = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());
    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable columns={columns} data={data} />
            {data.length === 0 && (
                <EmptyState title="Create your first agent" description="Add the new agent by clicking on New Agent button." />
            )}
        </div>
    )
}

export const AgentsViewLoadingState = () => {
    return <LoadingState title="Loading agents" description="This may take a few seconds" />;
}

export const AgentsViewErrorState = () => {
    return <ErrorState title="Failed to load agents" description="Please try again later." />
}



export default AgentsView;