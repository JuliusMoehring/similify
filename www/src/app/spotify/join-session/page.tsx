"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { DicesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useSpotify } from "~/contexts/spotify";
import { usePersistedState } from "~/hooks/use-persisted-state";
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

export default function SpotifyJoinSession() {
    const router = useRouter();

    const [sessionId] = usePersistedState(
        z.string(),
        "spotify:join-session:session-id",
        null,
    );

    const { accessToken } = useSpotify();

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

        if (!accessToken) {
            toast.error("You need to request access to Spotify first.");

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
                ...accessToken,
            });

            await loadTopArtistsMutation.mutateAsync({
                attendeeId,
                sessionId,
                ...accessToken,
            });

            router.replace(`/session/${sessionId}`);
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
                                        <DicesIcon className="w-4 h-4" />
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

                    <Button type="submit">Join session</Button>
                </form>
            </Form>
        </div>
    );
}
