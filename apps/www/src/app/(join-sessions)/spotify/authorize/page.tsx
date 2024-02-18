"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { SpotifyAuthorizationButton } from "~/components/spotify/authorization-button";
import { Headline } from "~/components/ui/headline";
import { usePersistedSessionId } from "~/hooks/use-persisted-session-id";
import { validateSessionId } from "~/lib/search-params";

export default function SpotifyAuthorize() {
    const searchParams = useSearchParams();
    const sessionId = validateSessionId(searchParams);

    const [_, setSessionId] = usePersistedSessionId(sessionId);

    if (!sessionId) {
        return <div>WE could not find your session id</div>;
    }

    useEffect(() => {
        setSessionId(sessionId);
    }, [sessionId]);

    return (
        <>
            <Headline tag="h1" size="s">
                Join Spotify Session
            </Headline>

            <p>
                Before you can join the session, you need to authorize your
                Spotify account.
            </p>

            <div className="flex justify-center">
                <SpotifyAuthorizationButton />
            </div>

            <p className="text-muted-foreground text-sm">
                In order for you to join the session, we need to access your
                Spotify account. When you continue and sign up for the session,
                we will read your Spotify top tracks and artists. This
                information will not be shared with anyone.
            </p>
        </>
    );
}
