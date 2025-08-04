import { ResponsiveDialog } from "@/components/responsive-dialog";
import AgentForm from "./agent-form";

interface NewAgentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewAgentDialog = ({ open, onOpenChange }: NewAgentDialogProps) => {
    return (
        <ResponsiveDialog title="New Agent" open={open} onOpenChange={onOpenChange} description="Create a new agent to assist you with your tasks.">
            <AgentForm onSuccess={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
        </ResponsiveDialog>
    )
}

export default NewAgentDialog