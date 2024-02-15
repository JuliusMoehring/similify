import { createContext, PropsWithChildren, useContext } from "react";
import { RouterOutputs } from "~/trpc/shared";

type QuestionViewModeContextType = {
    id: string;
    type: string;
    question: string;
    order: number;
    options: {
        id: string;
        option: string;
    }[];
    isFirst: boolean;
    isLast: boolean;
};

const QuestionViewModeContext =
    createContext<QuestionViewModeContextType | null>(null);

type QuestionViewModeProviderProps = {
    question: RouterOutputs["custom"]["getSessionQuestions"][number];
    isFirst: boolean;
    isLast: boolean;
};

export function QuestionViewModeProvider({
    question,
    isFirst,
    isLast,
    children,
}: PropsWithChildren<QuestionViewModeProviderProps>) {
    return (
        <QuestionViewModeContext.Provider
            value={{
                ...question,
                isFirst,
                isLast,
            }}
        >
            {children}
        </QuestionViewModeContext.Provider>
    );
}

export function useQuestionViewMode() {
    const context = useContext(QuestionViewModeContext);

    if (context === null) {
        const error = new Error(
            "useQuestionViewMode must be used within a QuestionViewModeContext",
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useQuestionViewMode);
        }

        throw error;
    }

    return context;
}
