"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { validateCode } from "~/lib/search-params";

export default function SpotifyAuthorizeCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = validateCode(searchParams);

    useEffect(() => {
        if (code) {
            router.replace("/spotify/join-session");
        }
    }, [code]);

    return null;
}
