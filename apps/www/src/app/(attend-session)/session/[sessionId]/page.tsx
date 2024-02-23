"use client";

import { usePublicSocket } from "~/contexts/public-socket";
import { api } from "~/trpc/react";
import { useEffect } from "react";
import { FreeTextAnswer } from "~/components/attend-session/free-text-answer";
import { SingleChoiceAnswer } from "~/components/attend-session/single-choice-answer";
import { MultipleChoiceAnswer } from "~/components/attend-session/multiple-choice-answer";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { AnswerContainer } from "~/components/attend-session/answer-container";

export default function Session({ params }: { params: { sessionId: string } }) {
    const sessionId = params.sessionId;

    const sessionQuery = api.session.getPublicSession.useQuery({ sessionId });

    const { isConnected, joinSession, currentMessage } = usePublicSocket();

    useEffect(() => {
        if (isConnected) {
            joinSession(sessionId);
        }
    }, [sessionId, isConnected]);

    if (sessionQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (sessionQuery.isError) {
        return <div>Error: {sessionQuery.error.message}</div>;
    }

    return (
        <div className="flex justify-center p-4">
            {currentMessage && (
                <AnswerContainer
                    message={currentMessage}
                    className="mt-16 max-h-96 w-[640px] max-w-full sm:mt-60"
                >
                    {currentMessage?.question.type ===
                        CUSTOM_QUESTION_TYPE.FREE_TEXT && <FreeTextAnswer />}

                    {currentMessage?.question.type ===
                        CUSTOM_QUESTION_TYPE.SINGLE_CHOICE && (
                        <SingleChoiceAnswer
                            question={currentMessage.question}
                        />
                    )}

                    {currentMessage?.question.type ===
                        CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE && (
                        <MultipleChoiceAnswer
                            question={currentMessage.question}
                        />
                    )}
                </AnswerContainer>
            )}
        </div>
    );
}
