"use client";

import { CopyToClipboardButton } from "~/components/copy-to-clipboard-button";
import { SessionAttendees } from "~/components/session/session-attendees";
import { SessionQuestions } from "~/components/session/session-questions";
import { UpdateSessionStatusButton } from "~/components/session/update-status-button";
import { Headline } from "~/components/ui/headline";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { constructInviteURL } from "~/lib/invite-url";
import { SESSION_TYPE } from "~/lib/session-type";
import { api } from "~/trpc/react";

export default function Session({ params }: { params: { sessionId: string } }) {
    const sessionId = params.sessionId;

    const sessionQuery = api.session.getSession.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        sessionQuery,
        "Failed to load session",
        "Failed to load session",
    );

    if (sessionQuery.isLoading) {
        return <div>Loading session...</div>;
    }

    if (sessionQuery.error) {
        return <div>Failed to load session</div>;
    }

    const { id, name, description, type } = sessionQuery.data;

    const inviteLink = constructInviteURL(type, sessionId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Headline tag="h2" size="s">
                    {name}
                </Headline>

                <UpdateSessionStatusButton sessionId={id} />
            </div>

            <p className="text-muted-foreground">{description}</p>

            <div className="space-y-2">
                <Label>Invite link</Label>

                <div className="border-input flex h-9 w-full items-center justify-between rounded-md border bg-transparent py-1 pl-3 text-sm shadow-sm">
                    <pre className="line-clamp-1 overflow-hidden">
                        {inviteLink}
                    </pre>

                    <CopyToClipboardButton
                        text={inviteLink}
                        variant="outline"
                        size="default"
                        className="rounded-l-none"
                    />
                </div>
            </div>

            <Separator />

            <SessionAttendees sessionId={id} />

            {type === SESSION_TYPE.CUSTOM && (
                <>
                    <Separator />

                    <SessionQuestions sessionId={sessionId} />
                </>
            )}
        </div>
    );
}
