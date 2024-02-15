import { useQuestionViewMode } from "../context";
import { QuestionViewModeContainer } from "./container";

export function FreeTextQuestionViewMode() {
    const { question } = useQuestionViewMode();

    return (
        <QuestionViewModeContainer>
            <p>{question}</p>
        </QuestionViewModeContainer>
    );
}
