import { ResponsiveDialog } from "@/components/responsive-dialog";
import AgentForm from "./agent-form";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AgentGetOne } from "../../types";

interface UpdateAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: AgentGetOne;
}

const UpdateAgentDialog = ({ open, onOpenChange, initialValues }: UpdateAgentDialogProps) => {
    return (
        <ResponsiveDialog title="Update Agent" open={open} onOpenChange={onOpenChange} description="Update agent details to assist you with your tasks.">
            <AgentForm onSuccess={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} initalValues={initialValues} />
        </ResponsiveDialog>
    )
}

export default UpdateAgentDialog