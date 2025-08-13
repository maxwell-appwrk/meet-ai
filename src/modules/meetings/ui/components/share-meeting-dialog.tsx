"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LinkIcon, CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ErrorState } from "@/components/error-state";

interface ShareMeetingDialogProps {
    meetingId: string;
    meetingName: string;
    isPublic: boolean;
    expiresAt?: string | null;
}

export const ShareMeetingDialog = ({ meetingId, meetingName, isPublic: initialIsPublic }: ShareMeetingDialogProps) => {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Fetch shareable link if meeting is public
    const { data: shareData, isLoading, error } = useQuery({
        ...trpc.meetings.getShareableLink.queryOptions({ id: meetingId }),
        enabled: open && isPublic,
    });

    // Toggle public access mutation
    const togglePublicAccess = useMutation({
        ...trpc.meetings.togglePublicAccess.mutationOptions(),
        onSuccess: async (data) => {
            setIsPublic(data.isPublic);
            await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }));
            await queryClient.invalidateQueries(trpc.meetings.getShareableLink.queryOptions({ id: meetingId }));
            toast.success("Meeting sharing settings updated");
        },
        onError: (error) => {
            toast.error(error.message);
            // Revert the optimistic update on error
            setIsPublic(!isPublic);
        },
    });

    const handleCopyLink = async () => {
        if (shareData?.link) {
            await navigator.clipboard.writeText(shareData.link);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleTogglePublic = (checked: boolean) => {
        // Optimistic update
        setIsPublic(checked);
        togglePublicAccess.mutate({
            id: meetingId,
            isPublic: checked,
        });
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (newOpen) {
                // Reset state when dialog opens
                setIsPublic(initialIsPublic);
                setCopied(false);
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <LinkIcon className="size-4 mr-2" />
                    Share Link
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Meeting Link</DialogTitle>
                    <DialogDescription>
                        Share &quot;{meetingName}&quot; with guests via a public link
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Public Access Toggle */}
                    <div className="flex items-start border p-2 rounded-lg justify-between space-x-2">
                        <Label htmlFor="public-access" className="flex flex-col items-start space-y-1">
                            <span className="text">Public Access</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                Allow anyone with the link to join this meeting
                            </span>
                        </Label>
                        <Switch
                            id="public-access"
                            checked={isPublic}
                            onCheckedChange={handleTogglePublic}
                            disabled={togglePublicAccess.isPending}
                        />
                    </div>

                    {/* Share Link Section */}
                    {isPublic && (
                        <div className="space-y-2">
                            <Label>Shareable Link</Label>
                            {isLoading ? (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
                                        <div className="h-10 w-10 animate-pulse bg-muted rounded-md" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Generating link...</p>
                                </div>
                            ) : error ? (
                                <ErrorState title="Failed to load link" description={error.message} />
                            ) : shareData?.link ? (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            value={shareData.link}
                                            readOnly
                                            className="font-mono text-sm"
                                        />
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={handleCopyLink}
                                        >
                                            {copied ? (
                                                <CheckIcon className="size-4" />
                                            ) : (
                                                <CopyIcon className="size-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {shareData.expiresAt && (
                                        <p className="text-sm text-muted-foreground">
                                            Expires on {format(new Date(shareData.expiresAt), "PPp")}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No shareable link available
                                </p>
                            )}
                        </div>
                    )}

                    {/* Instructions */}
                    {isPublic && shareData?.link && (
                        <div className="rounded-lg border bg-muted/50 p-3">
                            <p className="text-sm text-muted-foreground">
                                Share this link with guests to allow them to join the meeting. 
                                They will be asked to enter their name before joining.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};