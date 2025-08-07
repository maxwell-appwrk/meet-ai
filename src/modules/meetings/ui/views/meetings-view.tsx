"use client";

import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { columns } from "../components/columns";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { DataPagination } from "@/components/data-pagination";

const MeetingsView = () => {
    const router = useRouter();
    const trpc = useTRPC();

    const [filters, setFilters] = useMeetingsFilters();

    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({ ...filters }));
    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable columns={columns} data={data.items} onRowClick={(row) => router.push(`/meetings/${row.id}`)} />
            <DataPagination page={filters.page} totalPages={data.totalPages} onPageChange={(page) => setFilters({ page })} />
            {data.items.length === 0 && (
                <EmptyState title="Create your first meeting" description="Add the new meeting by clicking on New Meeting button." />
            )}
        </div>
    )
}

export const MeetingsViewLoadingState = () => {
    return <LoadingState title="Loading meetings" description="This may take a few seconds" />;
}

export const MeetingsViewErrorState = () => {
    return <ErrorState title="Failed to load meetings" description="Please try again later." />
}


export default MeetingsView;