"use client";

import { redirect, useSearchParams } from "next/navigation";

import {
    validateCode,
    validateSpotifyAuthorizationError,
} from "~/lib/search-params";

export default function SpotifyAuthorizeCallback() {
    const searchParams = useSearchParams();
    const code = validateCode(searchParams);
    const error = validateSpotifyAuthorizationError(searchParams);

    if (code) {
        redirect(`/spotify/join-session?code=${code}`);
    }

    if (error) {
        redirect(`/spotify/error?error=${error}`);
    }

    return null;
}
