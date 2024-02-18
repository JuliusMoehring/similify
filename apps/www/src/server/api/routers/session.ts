import { TRPCError } from "@trpc/server";
import { and, eq } from "database";
import { attendees, sessions } from "database/src/schema/session";
import { ZodError, z } from "zod";

import { SESSION_STATUS, SessionStatusSchema } from "~/lib/session-status";
import { SessionTypeSchema } from "~/lib/session-type";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { NeonDbError } from "@neondatabase/serverless";
import { ERROR_MAP } from "~/lib/error-map";

const GetSessionResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    status: SessionStatusSchema,
    type: SessionTypeSchema,
    creatorId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

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

                return GetSessionResponseSchema.parse(session);
            } catch (error) {
                console.error(error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                if (error instanceof ZodError) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Invalid session data.",
                    });
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
                if (error instanceof NeonDbError && error.code === "23505") {
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

    updateSessionStatus: protectedProcedure
        .input(
            z.object({
                sessionId: z.string().uuid(),
                status: SessionStatusSchema,
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { db, session } = ctx;
            const { sessionId, status } = input;
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

                await db
                    .update(sessions)
                    .set({
                        status,
                    })
                    .where(eq(sessions.id, sessionId));

                return true;
            } catch (error) {
                console.error(error);

                if (error instanceof TRPCError) {
                    throw error;
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not update session status.",
                });
            }
        }),
});
