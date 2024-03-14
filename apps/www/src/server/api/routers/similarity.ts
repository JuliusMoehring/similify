import { TRPCError } from "@trpc/server";
import { and, customQuestions, eq, sessions } from "database";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const similarityRouter = createTRPCRouter({
    getQuestionSimilarities: protectedProcedure
        .input(
            z.object({
                questionId: z.string().uuid(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const userId = session.userId;
            const { questionId } = input;

            try {
                const questions = await db
                    .select({
                        id: customQuestions.id,
                    })
                    .from(customQuestions)
                    .leftJoin(
                        sessions,
                        eq(customQuestions.sessionId, sessions.id),
                    )
                    .where(
                        and(
                            eq(customQuestions.id, questionId),
                            eq(sessions.creatorId, userId),
                        ),
                    );

                if (!questions || questions.length !== 1) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Question not found.",
                    });
                }

                const similarities =
                    await db.query.customQuestionAnswerSimilarity.findMany({
                        columns: {
                            id: true,
                            sessionId: true,
                            similarityValue: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                        with: {
                            attendee: {
                                columns: {
                                    id: true,
                                    name: true,
                                },
                            },
                            similarAttendee: {
                                columns: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                        where: (table) => eq(table.questionId, questionId),
                    });

                const nodesMap = similarities.reduce((acc, similarity) => {
                    acc.set(similarity.attendee.id, similarity.attendee);
                    acc.set(
                        similarity.similarAttendee.id,
                        similarity.similarAttendee,
                    );

                    return acc;
                }, new Map<string, { id: string; name: string }>());

                const nodes = Array.from(nodesMap.values());

                const links = similarities.map((similarity) => ({
                    source: similarity.attendee.id,
                    target: similarity.similarAttendee.id,
                    value: z.coerce.number().parse(similarity.similarityValue),
                }));

                return {
                    nodes,
                    links,
                };
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get question similarities",
                });
            }
        }),

    getSessionSimilarities: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { db } = ctx;
            const { sessionId } = input;

            try {
                const similarities =
                    await db.query.attendeeSimilarities.findMany({
                        columns: {
                            id: true,
                            sessionId: true,
                            similarityValue: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                        with: {
                            attendee: {
                                columns: {
                                    id: true,
                                    name: true,
                                },
                            },
                            similarAttendee: {
                                columns: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                        where: (similarity) =>
                            eq(similarity.sessionId, sessionId),
                    });

                const nodesMap = similarities.reduce((acc, similarity) => {
                    acc.set(similarity.attendee.id, similarity.attendee);
                    acc.set(
                        similarity.similarAttendee.id,
                        similarity.similarAttendee,
                    );

                    return acc;
                }, new Map<string, { id: string; name: string }>());

                const nodes = Array.from(nodesMap.values());

                const links = similarities.map((similarity) => ({
                    source: similarity.attendee.id,
                    target: similarity.similarAttendee.id,
                    value: z.coerce.number().parse(similarity.similarityValue),
                }));

                return {
                    nodes,
                    links,
                };
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to get session similarities",
                });
            }
        }),
});
