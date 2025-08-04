"use client";
import { authClient } from "@/lib/auth-client";

const HomeView = () => {
    const { data: session } = authClient.useSession();

    if (!session) {
        return (
            <p>
                Loading
            </p>
        )
    }

    return (
        <div>
            <h1>Welcome to the Meet AI Application</h1>
            <p>Hello, {session.user.name || session.user.email}!</p>
            <p>Your session is active.</p>
            <p>Session ID: {session.session.id}</p>
            <p>Expires at: {new Date(session.session.expiresAt).toLocaleString()}</p>
        </div>
    );
}

export default HomeView;