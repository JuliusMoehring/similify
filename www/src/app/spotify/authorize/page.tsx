"use client";

import { useSearchParams } from "next/navigation";

import { Button } from "~/components/ui/button";
import { useSpotify } from "~/contexts/spotify";
import { validateSessionID } from "~/lib/search-params";

export default function SpotifyAuthorize() {
    const searchParams = useSearchParams();
    const sessionID = validateSessionID(searchParams);
    const { requestAccess } = useSpotify();

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
