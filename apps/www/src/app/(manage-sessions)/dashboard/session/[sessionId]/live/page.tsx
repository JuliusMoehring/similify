"use client";

import { CurrentAnswerCount } from "~/components/manage-session/custom/current-answer-count";
import { UpdateSessionStatusButton } from "~/components/session/update-status-button";
import { SimilarityGraph } from "~/components/similarity/graph";
import { Button } from "~/components/ui/button";
import { Headline } from "~/components/ui/headline";
import { InternalLinkButton } from "~/components/ui/link-button";
import { useAdminSocket } from "~/contexts/admin-socket";
import { useGetSession } from "~/hooks/use-get-session";
import { useGetSessionSimilarities } from "~/hooks/use-get-session-similarities";
import { SESSION_STATUS } from "~/lib/session-status";

export default function SessionLivePage({
    params,
}: {
    params: { sessionId: string };
}) {
    const sessionId = params.sessionId;

    const { nextQestion, closeQuestion, currentQuestion } = useAdminSocket();

    const sessionQuery = useGetSession(sessionId);

    const similaritiesQuery = useGetSessionSimilarities(sessionId);

    if (sessionQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (sessionQuery.isError) {
        return <div>Error: {sessionQuery.error.message}</div>;
    }

    if (sessionQuery.data.status !== SESSION_STATUS.IN_PROGRESS) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <Headline tag="h1">Session is not live</Headline>

                <p className="mt-2 text-muted-foreground">
                    Please go back to the session page
                </p>

                <InternalLinkButton
                    href={`/dashboard/session/${sessionId}`}
                    className="mt-8"
                >
                    Go back to session
                </InternalLinkButton>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-end gap-4">
                {currentQuestion ? (
                    <Button onClick={() => closeQuestion(sessionId)}>
                        Close Question
                    </Button>
                ) : (
                    <Button onClick={() => nextQestion(sessionId)}>
                        Next Question
                    </Button>
                )}

                <UpdateSessionStatusButton sessionId={sessionId} />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span>Current Question:</span>
                    {currentQuestion ? (
                        <span className="font-bold">
                            {currentQuestion.question}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">
                            No question
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <span>Current Answer Count:</span>

                    <CurrentAnswerCount
                        sessionId={sessionId}
                        questionId={currentQuestion?.id}
                    />
                </div>
            </div>

            {similaritiesQuery.data && (
                <SimilarityGraph
                    nodes={similaritiesQuery.data.nodes}
                    links={similaritiesQuery.data.links}
                />
            )}
        </div>
    );
}
