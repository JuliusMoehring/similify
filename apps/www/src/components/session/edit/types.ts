import { z } from "zod";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";

const CustomSessionInitialSchema = z.object({
    type: z.null(),
    question: z.string(),
});

const CustomQuestionFreeTextSchema = z.object({
    type: z.literal(CUSTOM_QUESTION_TYPE.FREE_TEXT),
    question: z.string(),
});

const CustomQuestionSingleChoiceSchema = z.object({
    type: z.literal(CUSTOM_QUESTION_TYPE.SINGLE_CHOICE),
    question: z.string(),
    options: z.array(
        z.object({
            option: z.string(),
        }),
    ),
});

const CustomQuestionMultipleChoiceSchema = z.object({
    type: z.literal(CUSTOM_QUESTION_TYPE.MULTIPLE_CHOICE),
    question: z.string(),
    options: z.array(
        z.object({
            option: z.string(),
        }),
    ),
});

type CustomQuestionMultipleChoiceSchema = z.infer<
    typeof CustomQuestionMultipleChoiceSchema
>;

export const FilledCustomQuestionsSchema = z.union([
    CustomQuestionFreeTextSchema,
    CustomQuestionSingleChoiceSchema,
    CustomQuestionMultipleChoiceSchema,
]);

export type FilledCustomQuestionsType = z.infer<
    typeof FilledCustomQuestionsSchema
>;

const CustomQuestionsSchema = z.union([
    CustomSessionInitialSchema,
    FilledCustomQuestionsSchema,
]);

export const EditQuestionsSchema = z.object({
    questions: z.array(CustomQuestionsSchema).min(1, {
        message: "You must add at least one question",
    }),
});

export type EditQuestionsType = z.infer<typeof EditQuestionsSchema>;
