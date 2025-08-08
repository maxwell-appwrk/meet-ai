import { EmptyState } from "@/components/empty-state";

export const ProcessingState = () => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center">
            <EmptyState
                title="Meeting is processing"
                description="Meeting is processing."
                image="/processing.svg"
            />
        </div>
    );
};