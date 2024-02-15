import { usePathname, useSearchParams } from "next/navigation";
import { InternalLinkButton } from "~/components/ui/link-button";
import { useHandleTRPCError } from "~/hooks/use-handle-trpc-error";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { SEARCH_PARAMS } from "~/lib/search-params";
import { api } from "~/trpc/react";
import { QuestionViewModeProvider } from "./context";
import { EmptyQuestions } from "./empty-state";
import { FreeTextQuestionViewMode } from "./types/free-text";
import { MultipleChoiceQuestionViewMode } from "./types/multiple-choice";
import { SingleChoiceQuestionViewMode } from "./types/single-choice";

type QuestionViewModeProps = {
    sessionId: string;
};

export function QuestionViewMode({ sessionId }: QuestionViewModeProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updatedSearchParams = new URLSearchParams(searchParams);
    updatedSearchParams.set(SEARCH_PARAMS.EDIT_MODE, "true");
    updatedSearchParams.sort();

    const questionsQuery = api.custom.getSessionQuestions.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        questionsQuery,
        "Could not load questions",
        "Could not load questions",
    );

    if (questionsQuery.data?.length === 0) {
        return <EmptyQuestions />;
    }

    return (
        <div className="space-y-4">
            <div>
                {questionsQuery.data?.map((question, index) => {
                    const isFirst = index === 0;
                    const isLast = index === questionsQuery.data.length - 1;

                    if (question.type === CUSTOM_QUESTION_TYPE.FREE_TEXT) {
                        return (
                            <QuestionViewModeProvider
                                key={question.id}
                                question={question}
                                isFirst={isFirst}
                                isLast={isLast}
                            >
                                <FreeTextQuestionViewMode />
                            </QuestionViewModeProvider>
                        );
                    }

                    if (question.type === CUSTOM_QUESTION_TYPE.SINGLE_CHOICE) {
                        return (
                            <QuestionViewModeProvider
                                key={question.id}
                                question={question}
                                isFirst={isFirst}
                                isLast={isLast}
                            >
                                <SingleChoiceQuestionViewMode />
                            </QuestionViewModeProvider>
                        );
                    }

                    if (
                        question.type === CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE
                    ) {
                        return (
                            <QuestionViewModeProvider
                                key={question.id}
                                question={question}
                                isFirst={isFirst}
                                isLast={isLast}
                            >
                                <MultipleChoiceQuestionViewMode />
                            </QuestionViewModeProvider>
                        );
                    }

                    return null;
                })}
            </div>
            <div className="flex justify-end">
                <InternalLinkButton
                    href={`${pathname}?${updatedSearchParams.toString()}`}
                >
                    Edit Questions
                </InternalLinkButton>
            </div>
        </div>
    );
}
