"use client";

import { CopyToClipboardButton } from "~/components/copy-to-clipboard-button";
import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { SEARCH_PARAMS } from "~/lib/search-params";
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

    const inviteURL = new URL(
        `${window.location.origin}/${sessionQuery.data.type.name.toLowerCase()}/authorize`,
    );

    inviteURL.searchParams.set(SEARCH_PARAMS.SESSION_ID, sessionQuery.data.id);

    const inviteLink = inviteURL.toString();

    return (
        <div>
            <div>Session {sessionId}</div>

            <div>
                Invite Link
                <pre>{inviteLink}</pre>
                <CopyToClipboardButton text={inviteLink} />
            </div>

            <code>{JSON.stringify(sessionQuery.data, null, 2)}</code>
        </div>
    );
}
