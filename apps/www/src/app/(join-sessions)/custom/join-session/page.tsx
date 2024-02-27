"use client";

import { TRPCClientError } from "@trpc/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { AttendSessionUsernameFormField } from "~/components/session/attend-session-form/username-form-field";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Headline } from "~/components/ui/headline";
import {
    AttendSessionFormType,
    useAttendSessionForm,
} from "~/hooks/use-attend-session-form";
import { useCustomSessionAttendeeId } from "~/hooks/use-custom-session-attendee-id";
import { validateRequiredSessionId } from "~/lib/search-params";
import { api } from "~/trpc/react";

export default function CustomJoinSession() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = validateRequiredSessionId(searchParams);

    const [_, setAttendeeId] = useCustomSessionAttendeeId(sessionId);

    const attendSessionMutation = api.session.attendSession.useMutation();

    const form = useAttendSessionForm();

    const onSubmit = async ({ username }: AttendSessionFormType) => {
        if (!sessionId) {
            toast.error("Session not found", {
                description: "Please try again using the link provided to you.",
            });

            return;
        }

        try {
            const attendeeId = await attendSessionMutation.mutateAsync({
                name: username,
                sessionId,
            });

            setAttendeeId(attendeeId);

            router.replace(`/session/${sessionId}`);
        } catch (error) {
            if (error instanceof TRPCClientError) {
                return toast.error("Joining session failed", {
                    description: error.message,
                });
            }

            return toast.error("Failed to join session", {
                description: JSON.stringify(error, null, 2),
            });
        }
    };

    return (
        <>
            <Headline tag="h1" size="s">
                Join Custom Session
            </Headline>

            <p className="text-muted-foreground text-sm">How does it work?</p>

            <p className="text-muted-foreground text-sm">
                After you join the session, you will be able to see the
                similarity between you and all the other attendees. The
                similarity will be calculated based on the answers you provide
                to the questions asked by the session creator. Once the session
                has started, you will be able to answer the questions and see
                the similarity graph update in real-time.
            </p>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4"
                >
                    <AttendSessionUsernameFormField form={form} />

                    <Button
                        type="submit"
                        disabled={attendSessionMutation.isLoading}
                    >
                        {attendSessionMutation.isLoading
                            ? "Joining session..."
                            : "Join session"}
                    </Button>
                </form>
            </Form>
        </>
    );
}
