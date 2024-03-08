import { z } from "zod";

export const SOCKET_EVENT = {
    NEXT_QUESTION: "next-question",
    CLOSE_QUESTION: "close-question",
    START_SESSION: "start-session",
    END_SESSION: "end-session",
    JOIN_SESSION: "join-session",
    LEAVE_SESSION: "leave-session",
} as const;

export const SocketEventSchema = z.enum([
    SOCKET_EVENT.NEXT_QUESTION,
    SOCKET_EVENT.CLOSE_QUESTION,
    SOCKET_EVENT.START_SESSION,
    SOCKET_EVENT.END_SESSION,
    SOCKET_EVENT.JOIN_SESSION,
    SOCKET_EVENT.LEAVE_SESSION,
]);

export type SocketEventType = z.infer<typeof SocketEventSchema>;

export const FreeTextQuestionMessageSchema = z.object({
    id: z.string().uuid(),
    order: z.number().int().positive(),
    question: z.string(),
    type: z.literal("free-text"),
});

export type FreeTextQuestionMessageType = z.infer<
    typeof FreeTextQuestionMessageSchema
>;

export const SingleChoiceQuestionMessageSchema = z.object({
    id: z.string().uuid(),
    order: z.number().int().positive(),
    question: z.string(),
    type: z.literal("single-choice"),
    options: z.array(z.object({ id: z.string().uuid(), option: z.string() })),
});

export type SingleChoiceQuestionMessageType = z.infer<
    typeof SingleChoiceQuestionMessageSchema
>;

export const MultipleChoiceQuestionMessageSchema = z.object({
    id: z.string().uuid(),
    order: z.number().int().positive(),
    question: z.string(),
    type: z.literal("multiple-choice"),
    options: z.array(z.object({ id: z.string().uuid(), option: z.string() })),
});

export type MultipleChoiceQuestionMessageType = z.infer<
    typeof MultipleChoiceQuestionMessageSchema
>;

export const QuestionSchema = z.union([
    FreeTextQuestionMessageSchema,
    SingleChoiceQuestionMessageSchema,
    MultipleChoiceQuestionMessageSchema,
]);

export type QuestionType = z.infer<typeof QuestionSchema>;

export const QuestionMessageSchema = z.object({
    question: z.union([
        FreeTextQuestionMessageSchema,
        SingleChoiceQuestionMessageSchema,
        MultipleChoiceQuestionMessageSchema,
    ]),
});

export type QuestionMessageType = z.infer<typeof QuestionMessageSchema>;

export const NextQuestionMessageSchema = z.union([
    z.object({
        status: z.literal("ok"),
        question: QuestionSchema,
    }),
    z.object({
        status: z.literal("error"),
        error: z.unknown(),
    }),
]);
