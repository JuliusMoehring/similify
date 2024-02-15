import { TRPCError } from "@trpc/server";

import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { sessions, attendees } from "database/src/schema/session";
import { eq, and } from "database";
import { SESSION_STATUS } from "~/lib/session-status";
import { SessionTypeSchema } from "~/lib/session-type";

export const sessionRouter = createTRPCRouter({
    getSessions: protectedProcedure.query(async ({ ctx }) => {
        const { session, db } = ctx;
        const userId = session.userId;

        try {
            const sessions = await db.query.sessions.findMany({
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
            const { session, db } = ctx;
            const userId = session.userId;

            try {
                const session = await db.query.sessions.findFirst({
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

    getSessionAttendees: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { session, db } = ctx;
            const userId = session.userId;

            try {
                const session = await db.query.sessions.findFirst({
                    columns: {
                        id: true,
                    },
                    with: {
                        attendees: {
                            columns: {
                                id: true,
                                name: true,
                            },
                        },
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
        .query(async ({ input, ctx }) => {
            const { sessionId } = input;
            const { db } = ctx;

            try {
                const session = await db.query.sessions.findFirst({
                    columns: {
                        id: true,
                        name: true,
                        description: true,
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
                name: z.string(),
                description: z.string(),
                type: SessionTypeSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { session, db } = ctx;
            const userId = session.userId;

            const { name, description, type } = input;

            try {
                const insertedSessions = await db
                    .insert(sessions)
                    .values({
                        creatorId: userId,
                        name,
                        description,
                        status: SESSION_STATUS.PLANNED,
                        type,
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

    attendSession: publicProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
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
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
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
