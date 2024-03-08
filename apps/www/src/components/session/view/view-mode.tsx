import { usePathname, useSearchParams } from "next/navigation";

import { InternalLinkButton } from "~/components/ui/link-button";
import { useGetSession } from "~/hooks/use-get-session";
import { useGetSessionQuestions } from "~/hooks/use-get-session-questions";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { SEARCH_PARAMS } from "~/lib/search-params";
import { SESSION_STATUS } from "~/lib/session-status";
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

    const sessionQuery = useGetSession(sessionId);

    const questionsQuery = useGetSessionQuestions(sessionId);

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

            {sessionQuery.data?.status === SESSION_STATUS.PLANNED && (
                <div className="flex justify-end">
                    <InternalLinkButton
                        href={`${pathname}?${updatedSearchParams.toString()}`}
                    >
                        Edit Questions
                    </InternalLinkButton>
                </div>
            )}
        </div>
    );
}
