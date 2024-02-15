"use client";

import {
    SpotifyApi,
    type AuthenticationResponse,
} from "@spotify/web-api-ts-sdk";
import {
    createContext,
    useCallback,
    useContext,
    type PropsWithChildren,
} from "react";

import { env } from "~/env";
import { SEARCH_PARAMS } from "~/lib/search-params";

type SpotifyContextType = {
    performUserAuthorization: (
        sessionId: string,
    ) => Promise<AuthenticationResponse>;
};

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: PropsWithChildren) {
    const performUserAuthorization = useCallback(async (sessionId: string) => {
        const postbackURL = new URL(
            `${window.location.origin}/api/spotify/token`,
        );

        postbackURL.searchParams.append(SEARCH_PARAMS.SESSION_ID, sessionId);

        const result = await SpotifyApi.performUserAuthorization(
            env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
            `${window.location.origin}/spotify/join-session`,
            [
                "user-read-email",
                "user-top-read",
                "user-read-recently-played",
                "user-follow-read",
            ],
            postbackURL.toString(),
        );

        return result;
    }, []);

    return (
        <SpotifyContext.Provider
            value={{
                performUserAuthorization,
            }}
        >
            {children}
        </SpotifyContext.Provider>
    );
}

export function useSpotify() {
    const context = useContext(SpotifyContext);

    if (context === null) {
        const error = new Error(
            "useSpotify must be used within a SpotifyContext",
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useSpotify);
        }

        throw error;
    }

    return context;
}
