import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Channel as StreanChannel } from "stream-chat";
import { useCreateChatClient, Chat, Channel, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

interface Props {
    meetingId: string,
    meetingName: string,
    userId: string,
    userImage: string | undefined,
    userName: string
}

const ChatUI = ({ meetingId, meetingName, userId, userImage, userName }: Props) => {
    const trpc = useTRPC();
    const { mutateAsync: generateChatToken } = useMutation(trpc.meetings.generateChatToken.mutationOptions())

    const [channel, setChannel] = useState<StreanChannel>();

    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
        tokenOrProvider: generateChatToken,
        userData: {
            id: userId,
            name: userName,
            image: userImage
        }
    });

    useEffect(() => {
        const channel = client?.channel("messaging", meetingId, {
            members: [userId]
        });
        setChannel(channel);
    }, [client, meetingId, userId]);

    if (!client) {
        return (
            <LoadingState
                title="Loading"
                description="Please wait while we load the chat"
            />
        )
    }

    return (
        <div className="bg-white rounded-2xl border overflow-hidden">
            <Chat client={client}>
                <Channel channel={channel}>
                    <Window>
                        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-23rem)] border-b">
                            <MessageList />
                        </div>
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    )

}

export default ChatUI;





