import { useGetSession } from "~/hooks/use-get-session";
import { SESSION_STATUS } from "~/lib/session-status";
import { QuestionsEditModeForm } from "./form";
import { useGetSessionQuestions } from "~/hooks/use-get-session-questions";

type QuestionEditModeProps = {
    sessionId: string;
};

export function QuestionEditMode({ sessionId }: QuestionEditModeProps) {
    const sessionQuery = useGetSession(sessionId);

    const questionsQuery = useGetSessionQuestions(sessionId);

    if (sessionQuery.isLoading || questionsQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (sessionQuery.isError || questionsQuery.isError) {
        return null;
    }

    if (sessionQuery.data.status !== SESSION_STATUS.PLANNED) {
        return null;
    }

    return (
        <QuestionsEditModeForm
            sessionId={sessionId}
            questions={questionsQuery.data}
        />
    );
}
