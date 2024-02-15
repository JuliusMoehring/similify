"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type AuthenticationResponse } from "@spotify/web-api-ts-sdk";
import { TRPCClientError } from "@trpc/client";
import { CheckCircle, DicesIcon, XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { useSpotify } from "~/contexts/spotify";
import { usePersistedSessionId } from "~/hooks/use-persisted-session-id";
import { ERROR_MAP, ERROR_MESSAGES } from "~/lib/error-map";
import { generateRandomUsername } from "~/lib/generate-random-username";
import { api } from "~/trpc/react";

const AttendSessionFormSchema = z.object({
    username: z
        .string()
        .min(2, {
            message: "Your username must be at least 2 characters.",
        })
        .regex(/^[a-zA-Z0-9_-]+$/, {
            message:
                "Your username can only contain letters, numbers, underscores, and hyphens.",
        }),
});

type AttendSessionFormType = z.infer<typeof AttendSessionFormSchema>;

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
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [sessionId] = usePersistedSessionId();

    const { performUserAuthorization } = useSpotify();

    const attendSessionMutation = api.session.attendSession.useMutation();
    const loadTopTracksMutation = api.spotify.loadTopTracks.useMutation();
    const loadTopArtistsMutation = api.spotify.loadTopArtists.useMutation();

    const form = useForm<AttendSessionFormType>({
        resolver: zodResolver(AttendSessionFormSchema),
        defaultValues: {
            username: "",
        },
    });

    const onSubmit = async ({ username }: AttendSessionFormType) => {
        if (!sessionId) {
            toast.error("You need to request access to Spotify first.");

            return;
        }

        let authenticationResponse: AuthenticationResponse | null = null;

        try {
            authenticationResponse = await performUserAuthorization(sessionId);
        } catch (error) {
            toast.error("Failed to authorize Spotify", {
                description: JSON.stringify(error, null, 2),
            });

            return;
        }

        try {
            const attendeeId = await attendSessionMutation.mutateAsync({
                name: username,
                sessionId,
            });

            await loadTopTracksMutation.mutateAsync({
                attendeeId,
                sessionId,
                ...authenticationResponse.accessToken,
            });

            await loadTopArtistsMutation.mutateAsync({
                attendeeId,
                sessionId,
                ...authenticationResponse.accessToken,
            });

            redirectTimeoutRef.current = setTimeout(() => {
                router.replace(`/session/${sessionId}`);
            }, 1_000);
        } catch (error) {
            if (error instanceof TRPCClientError) {
                switch (error.message) {
                    case ERROR_MAP.USERNAME_ALREADY_TAKEN:
                        return form.setError("username", {
                            type: "validate",
                            message: ERROR_MESSAGES.USERNAME_ALREADY_TAKEN,
                        });

                    default:
                        return toast.error(error.message);
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

    const isJoiningSession =
        attendSessionMutation.isLoading ||
        loadTopTracksMutation.isLoading ||
        loadTopArtistsMutation.isLoading;

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>

                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
                                            {...field}
                                        />
                                    </FormControl>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            form.clearErrors("username");
                                            form.setValue(
                                                "username",
                                                generateRandomUsername(),
                                            );
                                        }}
                                    >
                                        <DicesIcon className="h-4 w-4" />
                                    </Button>
                                </div>

                                <FormMessage />

                                <FormDescription>
                                    Your name will be used to display the
                                    similarity between the attendees of the
                                    session once the session is live. Make sure
                                    to use a name that you are comfortable with
                                    sharing with others.
                                </FormDescription>
                            </FormItem>
                        )}
                    />

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
