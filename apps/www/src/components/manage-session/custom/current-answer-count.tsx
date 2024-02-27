import { useGetQuestionAnswerCount } from "@hooks/use-get-session-question-answer-count";
import { Badge } from "@ui/badge";

type CurrentAnswerCountProps = {
    sessionId: string;
    questionId: string | undefined;
};

export function CurrentAnswerCount({
    sessionId,
    questionId,
}: CurrentAnswerCountProps) {
    const questionAnswerCountQuery = useGetQuestionAnswerCount(
        sessionId,
        questionId,
    );

    return <Badge>{questionAnswerCountQuery.data}</Badge>;
}
