import { useQuestionViewMode } from "../context";
import { QuestionViewModeContainer } from "./container";

export function MultipleChoiceQuestionViewMode() {
    const { question, options } = useQuestionViewMode();

    return (
        <QuestionViewModeContainer>
            <p>{question}</p>

            <div className="mt-4 space-y-1">
                {options.map(({ id, option }) => (
                    <div key={id} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-muted-foreground" />
                        <span className="text-sm">{option}</span>
                    </div>
                ))}
            </div>
        </QuestionViewModeContainer>
    );
}
