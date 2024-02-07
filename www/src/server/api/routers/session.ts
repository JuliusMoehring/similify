import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import postgres from "postgres";
import { z } from "zod";

import { ERROR_MAP } from "~/lib/error-map";
import { db } from "~/server/db";
import { attendees, sessions } from "~/server/db/schema/session";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const sessionRouter = createTRPCRouter({
    getSessionTypes: protectedProcedure.query(async () => {
        try {
            const sessionTypes = await db.query.sessionTypes.findMany();

            return sessionTypes;
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Could not load session types.",
            });
        }
    }),

    getSessions: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.userId;

        try {
            const sessions = await db.query.sessions.findMany({
                with: {
                    type: true,
                },
                where: (session) => eq(session.creatorId, userId),
                orderBy: (session, { desc }) => [desc(session.createdAt)],
            });

            return sessions;
        } catch (error) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Could not load sessions.",
            });
        }
    }),

    getSession: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.userId;

            try {
                const session = await db.query.sessions.findFirst({
                    with: {
                        type: true,
                        attendees: true,
                    },
                    where: (session) =>
                        and(
                            eq(session.creatorId, userId),
                            eq(session.id, input.sessionId),
                        ),
                });

                if (!session) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Session not found.",
                    });
                }

                return session;
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not load session.",
                });
            }
        }),

    getPublicSession: publicProcedure
        .input(z.object({ sessionId: z.string().uuid() }))
        .query(async ({ input }) => {
            const { sessionId } = input;

            try {
                const session = await db.query.sessions.findFirst({
                    columns: {
                        id: true,
                        name: true,
                    },
                    with: {
                        type: {
                            columns: {
                                name: true,
                            },
                        },
                    },
                    where: (session) => eq(session.id, sessionId),
                });

                if (!session) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Session not found.",
                    });
                }

                return session;
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not load session.",
                });
            }
        }),

    createSession: protectedProcedure
        .input(
            z.object({
                typeId: z.string().uuid(),
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.userId;

            const { typeId, name } = input;

            try {
                const insertedSessions = await db
                    .insert(sessions)
                    .values({
                        typeId,
                        creatorId: userId,
                        name,
                    })
                    .returning({
                        id: sessions.id,
                    });

                const insertedSession = insertedSessions[0];

                if (!insertedSession) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Could not create session.",
                    });
                }

                return insertedSession.id;
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not create session.",
                });
            }
        }),

    attendSession: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
                name: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const { sessionId, name } = input;

            try {
                const insertedAttendees = await db
                    .insert(attendees)
                    .values({
                        session_id: sessionId,
                        name,
                    })
                    .returning({
                        id: attendees.id,
                    });

                const insertedAttendee = insertedAttendees[0];

                if (!insertedAttendee) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Could not attend session.",
                    });
                }

                return insertedAttendee.id;
            } catch (error) {
                if (
                    error instanceof postgres.PostgresError &&
                    error.code === "23505"
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: ERROR_MAP.USERNAME_ALREADY_TAKEN,
                    });
                }

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not attend session.",
                });
            }
        }),

    unAttendSession: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
                attendeeId: z.string().uuid(),
                name: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const { sessionId, attendeeId, name } = input;

            try {
                await db
                    .delete(attendees)
                    .where(
                        and(
                            eq(attendees.session_id, sessionId),
                            eq(attendees.id, attendeeId),
                            eq(attendees.name, name),
                        ),
                    );

                return true;
            } catch (error) {
                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not unattend session.",
                });
            }
        }),
});
