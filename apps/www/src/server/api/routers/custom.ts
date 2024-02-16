import { TRPCError } from "@trpc/server";
import { and, customQuestionOptions, customQuestions, eq } from "database";
import { z } from "zod";

import { FilledCustomQuestionsSchema } from "~/components/session/edit/types";
import { CUSTOM_QUESTION_TYPE } from "~/lib/custom-question-type";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const customRouter = createTRPCRouter({
    getSessionQuestions: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { sessionId } = input;
            const { db, session } = ctx;
            const userId = session.userId;

            try {
                const session = await db.query.sessions.findFirst({
                    where: (session) =>
                        and(
                            eq(session.id, sessionId),
                            eq(session.creatorId, userId),
                        ),
                });

                if (!session) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Session not found.",
                    });
                }

                return await db.query.customQuestions.findMany({
                    columns: {
                        id: true,
                        question: true,
                        type: true,
                        order: true,
                    },
                    with: {
                        options: {
                            columns: { id: true, option: true },
                        },
                    },
                    where: (question) => eq(question.sessionId, sessionId),
                    orderBy: (question, { asc }) => [asc(question.order)],
                });
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not load custom questions.",
                });
            }
        }),

    createCustomQuestions: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
                questions: z.array(FilledCustomQuestionsSchema),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
            const { sessionId } = input;

            try {
                await db
                    .delete(customQuestions)
                    .where(eq(customQuestions.sessionId, sessionId));

                for (const [index, question] of input.questions.entries()) {
                    const customQuestionsFromDatabase = await db
                        .insert(customQuestions)
                        .values({
                            sessionId,
                            question: question.question,
                            type: question.type,
                            order: index + 1,
                        })
                        .returning({
                            id: customQuestions.id,
                        });

                    const customQuestion = customQuestionsFromDatabase[0];

                    if (!customQuestion) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Could not create custom questions.",
                        });
                    }

                    if (question.type === CUSTOM_QUESTION_TYPE.FREE_TEXT) {
                        continue;
                    }

                    await db.insert(customQuestionOptions).values(
                        question.options.map((option) => ({
                            questionId: customQuestion.id,
                            option: option.option,
                        })),
                    );
                }
            } catch (error) {
                console.error(error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not create custom questions.",
                });
            }
        }),
});
