import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingGetOne } from "../../types";
import MeetingForm from "./meeting-form";

interface UpdateMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: MeetingGetOne;
}

const UpdateMeetingDialog = ({ open, onOpenChange, initialValues }: UpdateMeetingDialogProps) => {
    return (
        <ResponsiveDialog title="Update Meeting" open={open} onOpenChange={onOpenChange} description="Update meeting details to assist you with your tasks.">
            <MeetingForm onSuccess={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} initalValues={initialValues} />
        </ResponsiveDialog>
    )
}

export default UpdateMeetingDialog