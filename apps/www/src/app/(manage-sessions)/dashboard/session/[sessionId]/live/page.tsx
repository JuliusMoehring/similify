"use client";

import { CurrentAnswerCount } from "~/components/manage-session/custom/current-answer-count";
import { UpdateSessionStatusButton } from "~/components/session/update-status-button";
import { Button } from "~/components/ui/button";
import { InternalLinkButton } from "~/components/ui/link-button";
import { useAdminSocket } from "~/contexts/admin-socket";
import { useGetSession } from "~/hooks/use-get-session";
import { SESSION_STATUS } from "~/lib/session-status";

export default function SessionLivePage({
    params,
}: {
    params: { sessionId: string };
}) {
    const sessionId = params.sessionId;

    const { nextQestion, currentQuestion } = useAdminSocket();

    const sessionQuery = useGetSession(sessionId);

    if (sessionQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (sessionQuery.isError) {
        return <div>Error: {sessionQuery.error.message}</div>;
    }

    if (sessionQuery.data.status !== SESSION_STATUS.IN_PROGRESS) {
        return (
            <div>
                Session is not live
                <p>Please go back to the session page</p>
                <InternalLinkButton href={`/dashboard/session/${sessionId}`}>
                    Go to session
                </InternalLinkButton>
            </div>
        );
    }

    return (
        <div>
            <UpdateSessionStatusButton sessionId={sessionId} />

            <Button onClick={() => nextQestion(sessionId)}>
                Next Question
            </Button>

            <CurrentAnswerCount
                sessionId={sessionId}
                questionId={currentQuestion?.id}
            />

            <code>{JSON.stringify(currentQuestion, null, 2)}</code>
        </div>
    );
}
