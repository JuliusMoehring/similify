"use client";

import { TRPCClientError } from "@trpc/client";
import { CheckCircle, XCircleIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AttendSessionUsernameFormField } from "~/components/session/attend-session-form/username-form-field";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import {
    AttendSessionFormType,
    useAttendSessionForm,
} from "~/hooks/use-attend-session-form";
import { usePersistedSessionId } from "~/hooks/use-persisted-session-id";
import { ERROR_MAP, ERROR_MESSAGES } from "~/lib/error-map";
import { SEARCH_PARAMS, validateCode } from "~/lib/search-params";
import { api } from "~/trpc/react";

type SpotifyDataLoadingStateProps = {
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    type: string;
};

function SpotifyDataLoadingState({
    isLoading,
    isError,
    isSuccess,
    type,
}: SpotifyDataLoadingStateProps) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-4">
                <LoadingSpinner />

                <p className="text-sm">Loading {type}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center gap-4">
                <XCircleIcon className="h-5 w-5 text-red-500" />

                <p className="text-sm">Error loading {type}</p>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="flex items-center gap-4">
                <CheckCircle className="h-5 w-5 text-green-500" />

                <p className="text-sm first-letter:capitalize">{type} loaded</p>
            </div>
        );
    }

    return null;
}

export default function SpotifyJoinSession() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const code = validateCode(searchParams);

    const [sessionId] = usePersistedSessionId();
    const [isJoiningSession, setIsJoiningSession] = useState(false);

    const attendSessionMutation = api.session.attendSession.useMutation();
    const getAccessTokenMutation = api.spotify.getToken.useMutation();
    const loadTopTracksMutation = api.spotify.loadTopTracks.useMutation();
    const loadTopArtistsMutation = api.spotify.loadTopArtists.useMutation();

    const form = useAttendSessionForm();

    const onSubmit = async ({ username }: AttendSessionFormType) => {
        if (!sessionId) {
            toast.error("Session not found", {
                description: "Please try again using the link provided to you.",
            });

            return;
        }

        if (!code) {
            return router.replace(`/spotify/authorize`);
        }

        try {
            setIsJoiningSession(true);

            const attendeeId = await attendSessionMutation.mutateAsync({
                name: username,
                sessionId,
            });

            const accessToken = await getAccessTokenMutation.mutateAsync({
                code,
            });

            await loadTopTracksMutation.mutateAsync({
                attendeeId,
                sessionId,
                ...accessToken,
            });

            await loadTopArtistsMutation.mutateAsync({
                attendeeId,
                sessionId,
                ...accessToken,
            });

            redirectTimeoutRef.current = setTimeout(() => {
                setIsJoiningSession(false);
                router.replace(`/session/${sessionId}`);
            }, 200);
        } catch (error) {
            setIsJoiningSession(false);

            if (error instanceof TRPCClientError) {
                switch (error.message) {
                    case ERROR_MAP.USERNAME_ALREADY_TAKEN:
                        return form.setError("username", {
                            type: "validate",
                            message: ERROR_MESSAGES.USERNAME_ALREADY_TAKEN,
                        });

                    case ERROR_MAP.INVALID_SPOTIFY_AUTHORIZATION:
                        const urlSearchParams = new URLSearchParams();

                        urlSearchParams.set(
                            SEARCH_PARAMS.SESSION_ID,
                            sessionId,
                        );

                        toast.error("Invalid Spotify authorization", {
                            description:
                                ERROR_MESSAGES.INVALID_SPOTIFY_AUTHORIZATION,
                        });

                        return router.replace(
                            `/spotify/authorize?${urlSearchParams.toString()}`,
                        );

                    default:
                        return toast.error("Joining session failed", {
                            description: error.message,
                        });
                }
            }

            return toast.error("Failed to join session", {
                description: JSON.stringify(error, null, 2),
            });
        }
    };

    useEffect(() => {
        return () => {
            if (!redirectTimeoutRef.current) {
                return;
            }

            clearTimeout(redirectTimeoutRef.current);
        };
    }, []);

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4"
                >
                    <AttendSessionUsernameFormField form={form} />

                    <SpotifyDataLoadingState
                        isLoading={loadTopTracksMutation.isLoading}
                        isError={loadTopTracksMutation.isError}
                        isSuccess={loadTopTracksMutation.isSuccess}
                        type="top tracks"
                    />

                    <SpotifyDataLoadingState
                        isLoading={loadTopArtistsMutation.isLoading}
                        isError={loadTopArtistsMutation.isError}
                        isSuccess={loadTopArtistsMutation.isSuccess}
                        type="top artists"
                    />

                    <Button type="submit" disabled={isJoiningSession}>
                        {isJoiningSession
                            ? "Joining session..."
                            : "Join session"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
