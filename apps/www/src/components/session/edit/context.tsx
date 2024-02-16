import { createContext, PropsWithChildren, useContext } from "react";
import { FieldArrayWithId, useFieldArray, useForm } from "react-hook-form";

import { EditQuestionsType } from "./types";

type SessionQuestionContextType = {
    index: number;
    handlers: Omit<
        ReturnType<typeof useFieldArray<EditQuestionsType, "questions", "id">>,
        "fields"
    >;
    field: FieldArrayWithId<EditQuestionsType, "questions", "id">;
    control: ReturnType<typeof useForm<EditQuestionsType>>["control"];
};

const SessionQuestionContext = createContext<SessionQuestionContextType | null>(
    null,
);

export function SessionQuestionProvider({
    index,
    handlers,
    field,
    control,
    children,
}: PropsWithChildren<SessionQuestionContextType>) {
    return (
        <SessionQuestionContext.Provider
            value={{
                index,
                handlers,
                field,
                control,
            }}
        >
            {children}
        </SessionQuestionContext.Provider>
    );
}

export function useSessionQuestion() {
    const context = useContext(SessionQuestionContext);

    if (context === null) {
        const error = new Error(
            "useSessionQuestion must be used within a SessionQuestionContext",
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useSessionQuestion);
        }

        throw error;
    }

    return context;
}
