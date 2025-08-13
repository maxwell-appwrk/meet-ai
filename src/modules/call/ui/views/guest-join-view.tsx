"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { VideoIcon, UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

const guestFormSchema = z.object({
    guestName: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

type GuestFormData = z.infer<typeof guestFormSchema>;

interface GuestJoinViewProps {
    accessToken: string;
}

const GuestJoinView = ({ accessToken }: GuestJoinViewProps) => {
    const router = useRouter();
    const trpc = useTRPC();
    const [isJoining, setIsJoining] = useState(false);

    // Validate meeting access
    const { data: meetingInfo, isLoading, error } = useQuery(trpc.meetings.validateGuestAccess.queryOptions({
        accessToken,
    }));


    const form = useForm<GuestFormData>({
        resolver: zodResolver(guestFormSchema),
        defaultValues: {
            guestName: "",
        },
    });

    const generateGuestToken = useMutation(trpc.meetings.generateGuestToken.mutationOptions({
        onSuccess: (data, variables) => {
            // Store guest info in session storage
            sessionStorage.setItem('guestToken', data.token);
            sessionStorage.setItem('guestId', data.guestId);
            sessionStorage.setItem('guestName', variables.guestName);
            sessionStorage.setItem('isGuest', 'true');

            // Redirect to call page
            router.push(`/call/${data.meetingId}`);
        },
        onError: (error) => {
            toast.error(error.message);
            setIsJoining(false);
        },
    }));

    const handleJoin = async (data: GuestFormData) => {
        setIsJoining(true);
        await generateGuestToken.mutateAsync({
            accessToken,
            guestName: data.guestName,
        });
    };

    if (isLoading) {
        return <LoadingState title="Validating meeting link" description="Please wait..." />;
    }

    if (error) {
        return <ErrorState title="Invalid Meeting Link" description={error.message} />;
    }

    if (!meetingInfo) {
        return <ErrorState title="Meeting Not Found" description="This meeting link is invalid." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <VideoIcon className="size-6 text-primary" />
                    </div>
                    <CardTitle>Join Meeting</CardTitle>
                    <CardDescription>
                        You&apos;re about to join &quot;{meetingInfo.meetingName}&quot; with {meetingInfo.agentName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleJoin)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="guestName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    placeholder="Enter your name"
                                                    className="pl-10"
                                                    disabled={isJoining}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isJoining || generateGuestToken.isPending}
                            >
                                {isJoining ? "Joining..." : "Join Meeting"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default GuestJoinView;