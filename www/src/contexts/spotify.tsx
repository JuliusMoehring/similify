"use client";

import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { env } from "~/env";
import { usePersistedState } from "~/hooks/use-persisted-state";
import { SEARCH_PARAMS } from "~/lib/search-params";

async function performUserAuthorization(sessionId: string) {
    const postbackURL = new URL("http://localhost:3000/api/spotify/token");

    postbackURL.searchParams.append(SEARCH_PARAMS.SESSION_ID, sessionId);

    const result = await SpotifyApi.performUserAuthorization(
        env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        "http://localhost:3000/spotify/join-session",
        [
            "user-read-email",
            "user-top-read",
            "user-read-recently-played",
            "user-follow-read",
        ],
        postbackURL.toString(),
    );

    return result;
}

const AccessTokenSchema = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
    expires: z.number().optional(),
});

type AccessTokenType = z.infer<typeof AccessTokenSchema>;

type SpotifyContextType = {
    accessToken: AccessTokenType | null;
    requestAccess: (sessionId: string) => Promise<void>;
    validateAccessGranted: (sessionId: string) => Promise<void>;
};

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: PropsWithChildren) {
    const [sessionId, setSessionId] = usePersistedState(
        z.string(),
        "spotify:join-session:session-id",
        null,
    );

    const [accessToken, setAccessToken] = usePersistedState(
        AccessTokenSchema,
        "spotify-sdk:AuthorizationCodeWithPKCEStrategy:token",
        null,
    );

    const [spotifySDKVerifier] = usePersistedState(
        z.object({ verifier: z.string(), expiresOnAccess: z.boolean() }),
        "spotify-sdk:verifier",
        null,
    );

    const requestAccess = async (sessionId: string) => {
        setSessionId(sessionId);

        try {
            await performUserAuthorization(sessionId);
        } catch (error) {
            console.error(error);

            toast.error("Failed to request access to Spotify");
        }
    };

    const validateAccessGranted = async (sessionId: string) => {
        try {
            const result = await performUserAuthorization(sessionId);

            if (!result) {
                return;
            }

            setAccessToken(result.accessToken);
        } catch (error) {
            console.warn(error);
        }
    };

    useEffect(() => {
        if (spotifySDKVerifier === null || sessionId === null) {
            return;
        }

        const timeout = setTimeout(() => {
            validateAccessGranted(sessionId);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [spotifySDKVerifier]);

    return (
        <SpotifyContext.Provider
            value={{
                accessToken,
                requestAccess,
                validateAccessGranted,
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
