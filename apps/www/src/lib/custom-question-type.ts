import { z } from "zod";

export const CUSTOM_QUESTION_TYPE = {
    FREE_TEXT: "free-text",
    SINGLE_CHOICE: "single-choice",
    MULTIPLE_CHOICE: "multiple-choice",
} as const;

export const CustomQuestionTypeSchema = z.enum([
    CUSTOM_QUESTION_TYPE.FREE_TEXT,
    CUSTOM_QUESTION_TYPE.SINGLE_CHOICE,
    CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE,
]);

export type CustomQuestionTypeType = z.infer<typeof CustomQuestionTypeSchema>;

export function customQustionTypeToHumanReadable(type: string) {
    return type
        .split("-")
        .map((word) => word[0]!.toUpperCase() + word.slice(1))
        .join(" ");
}
