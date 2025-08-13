"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { ErrorState } from "@/components/error-state";
import { CallConnect } from "../components/call-connect";
import { generateAvatarUri } from "@/lib/avatar";

interface Props {
    meetingId: string;
}

const GuestCallView = ({ meetingId }: Props) => {
    const router = useRouter();
    const [guestInfo, setGuestInfo] = useState<{
        token: string;
        guestId: string;
        guestName: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if guest has valid token in session storage
        const token = sessionStorage.getItem('guestToken');
        const guestId = sessionStorage.getItem('guestId');
        const isGuest = sessionStorage.getItem('isGuest');

        if (!token || !guestId || isGuest !== 'true') {
            // No guest credentials, redirect to home
            router.push('/');
            return;
        }

        // Extract guest name from the guestId (format: guest_XXXXXXXXXX)
        // For now, we'll need to store the name separately or get it from the meeting
        // Let's store it in session storage when generating token
        const guestName = sessionStorage.getItem('guestName') || 'Guest';

        setGuestInfo({
            token,
            guestId,
            guestName,
        });
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-radial from-sidebar-accent to-sidebar">
                <LoaderIcon className="size-6 animate-spin text-white" />
            </div>
        );
    }

    if (!guestInfo) {
        return (
            <div className="flex h-screen items-center justify-center">
                <ErrorState 
                    title="Access Denied" 
                    description="You don't have permission to join this meeting." 
                />
            </div>
        );
    }

    // For guest users, we don't have meeting name from tRPC query
    // We could add it to session storage or make a public endpoint
    const meetingName = "Meeting"; // This could be enhanced

    return (
        <CallConnect 
            meetingId={meetingId} 
            meetingName={meetingName}
            userId={guestInfo.guestId}
            userName={guestInfo.guestName}
            userImage={generateAvatarUri({ seed: guestInfo.guestName, variant: "initials" })}
            customToken={guestInfo.token}
        />
    );
};

export default GuestCallView;