"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { useSpotify } from "~/contexts/spotify";
import { usePersistedSessionId } from "~/hooks/use-persisted-session-id";
import { validateSessionId } from "~/lib/search-params";

export default function SpotifyAuthorize() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionID = validateSessionId(searchParams);

    const [_, setSessionId] = usePersistedSessionId(sessionID);

    const { performUserAuthorization } = useSpotify();

    const requestAccess = async (sessionId: string) => {
        setSessionId(sessionId);

        try {
            const result = await performUserAuthorization(sessionId);

            console.log(result);

            if (result.authenticated) {
                router.push("/spotify/join-session");
            }
        } catch (error) {
            console.error(error);

            toast.error("Could not authorize Spotify");
        }
    };

    if (!sessionID) {
        return <div>WE could not find your session id</div>;
    }

    return (
        <main>
            <p>How does it work?</p>

            <p>
                When you join the session using Spotify, we will look at your
                top tracks and artists
            </p>

            <Button
                onClick={() => requestAccess(sessionID)}
                style={{ backgroundColor: "#1ED760" }}
            >
                Authorize Spotify
            </Button>
        </main>
    );
}
