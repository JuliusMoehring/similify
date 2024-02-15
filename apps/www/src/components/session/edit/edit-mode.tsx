import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { api } from "~/trpc/react";
import { QuestionsEditModeForm } from "./form";

type QuestionEditModeProps = {
    sessionId: string;
};

export function QuestionEditMode({ sessionId }: QuestionEditModeProps) {
    const questionsQuery = api.custom.getSessionQuestions.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        questionsQuery,
        "Could not load questions",
        "Could not load questions",
    );

    if (questionsQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (questionsQuery.isError) {
        return null;
    }

    return (
        <QuestionsEditModeForm
            sessionId={sessionId}
            questions={questionsQuery.data}
        />
    );
}
