"use client";

import { CopyToClipboardButton } from "~/components/copy-to-clipboard-button";
import { SessionAttendees } from "~/components/session/session-attendees";
import { SessionQuestions } from "~/components/session/session-questions";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useAdminSocket } from "~/contexts/admin-socket";
import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { SEARCH_PARAMS } from "~/lib/search-params";
import { SESSION_TYPE } from "~/lib/session-type";
import { api } from "~/trpc/react";

export default function Session({ params }: { params: { sessionId: string } }) {
    const { isConnected } = useAdminSocket();

    console.log(isConnected);
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

    const inviteURL = new URL(`${window.location.origin}/${type}/authorize`);

    inviteURL.searchParams.set(SEARCH_PARAMS.SESSION_ID, id);

    const inviteLink = inviteURL.toString();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">{name}</h2>

            <p>{description}</p>

            <div className="space-y-2">
                <Label>Invite link</Label>

                <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent py-1 pl-3 text-sm shadow-sm">
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
