import GuestJoinView from "@/modules/call/ui/views/guest-join-view";

interface Props {
    params: Promise<{ accessToken: string }>
}

const GuestJoinPage = async ({ params }: Props) => {
    const { accessToken } = await params;

    return <GuestJoinView accessToken={accessToken} />;
}

export default GuestJoinPage;