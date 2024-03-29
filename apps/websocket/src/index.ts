import { createServer } from "node:http";
import { db, eq } from "database";
import express from "express";
import getPort, { portNumbers } from "get-port";
import { Server } from "socket.io";
import { SOCKET_EVENT } from "socket/src/client";
import { ActiveSessionHandler } from "socket/src/server";
import { z, ZodError } from "zod";

import { env } from "./env";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
    connectionStateRecovery: {},
});

const publicIO = io.of("/public");
const adminIO = io.of("/admin");

let port = z.coerce.number().default(3001).parse(process.env.PORT);

if (env.NODE_ENV === "development") {
    port = await getPort({ port: portNumbers(3001, 3100) });
}

app.get("/health-check", (_req, res) => {
    res.json({ status: "ok" });
});

const JoinSessionMessageSchema = z.object({
    sessionId: z.string().uuid(),
});

const LeaveSessionMessageSchema = z.object({
    sessionId: z.string().uuid(),
});

const StartSessionMessageSchema = z.object({
    sessionId: z.string().uuid(),
});

const NextQuestionMessageSchema = z.object({
    sessionId: z.string().uuid(),
});

const CloseQuestionMessageSchema = z.object({
    sessionId: z.string().uuid(),
});

const EndSessionMessageSchema = z.object({
    sessionId: z.string().uuid(),
});

publicIO.on("connection", (socket) => {
    socket.on("disconnect", () => {});

    socket.on(SOCKET_EVENT.JOIN_SESSION, (message) => {
        try {
            const { sessionId } = JoinSessionMessageSchema.parse(message);

            socket.join(sessionId);

            socket.emit(SOCKET_EVENT.JOIN_SESSION, {
                status: "ok",
            });
        } catch (error) {
            console.error("Failed to join session", error);

            if (error instanceof ZodError) {
                return socket.emit(SOCKET_EVENT.JOIN_SESSION, {
                    status: "error",
                    error: JSON.parse(error.message),
                });
            }
        }
    });

    socket.on(SOCKET_EVENT.LEAVE_SESSION, (message) => {
        try {
            const { sessionId } = LeaveSessionMessageSchema.parse(message);

            socket.leave(sessionId);

            socket.emit(SOCKET_EVENT.LEAVE_SESSION, {
                status: "ok",
            });
        } catch (error) {
            console.error("Failed to leave session", error);

            if (error instanceof ZodError) {
                return socket.emit(SOCKET_EVENT.LEAVE_SESSION, {
                    status: "error",
                    error: JSON.parse(error.message),
                });
            }
        }
    });
});

adminIO.use((socket, next) => {
    const apiKey = socket.handshake.headers.authorization;

    if (apiKey !== env.API_KEY) {
        return next(new Error("Not authorized."));
    }

    next();
});

const sessions = new Map<string, ActiveSessionHandler>();

adminIO.on("connection", (socket) => {
    socket.on(SOCKET_EVENT.START_SESSION, async (message) => {
        try {
            const { sessionId } = StartSessionMessageSchema.parse(message);

            const session = await db.query.sessions.findFirst({
                where: (session) => eq(session.id, sessionId),
            });

            if (!session) {
                throw new Error("Session not found");
            }

            const activeSessionHandler = new ActiveSessionHandler(sessionId);

            sessions.set(sessionId, activeSessionHandler);

            await activeSessionHandler.init();

            activeSessionHandler.startSession(socket);
        } catch (error) {
            console.error("Failed to start session", error);

            if (error instanceof ZodError) {
                return socket.emit(SOCKET_EVENT.START_SESSION, {
                    status: "error",
                    error: JSON.parse(error.message),
                });
            }

            if (error instanceof Error) {
                return socket.emit(SOCKET_EVENT.START_SESSION, {
                    status: "error",
                    error: error.message,
                });
            }
        }
    });

    socket.on(SOCKET_EVENT.NEXT_QUESTION, async (message) => {
        try {
            const { sessionId } = NextQuestionMessageSchema.parse(message);

            const activeSessionHandler = sessions.get(sessionId);

            if (!activeSessionHandler) {
                throw new Error("Session not found");
            }

            activeSessionHandler.nextQuestion(socket, publicIO);
        } catch (error) {
            console.error("Failed to change next question", error);

            if (error instanceof ZodError) {
                return socket.emit(SOCKET_EVENT.NEXT_QUESTION, {
                    status: "error",
                    error: JSON.parse(error.message),
                });
            }

            if (error instanceof Error) {
                return socket.emit(SOCKET_EVENT.NEXT_QUESTION, {
                    status: "error",
                    error: error.message,
                });
            }
        }
    });

    socket.on(SOCKET_EVENT.CLOSE_QUESTION, async (message) => {
        try {
            const { sessionId } = CloseQuestionMessageSchema.parse(message);

            const activeSessionHandler = sessions.get(sessionId);

            if (!activeSessionHandler) {
                throw new Error("Session not found");
            }

            activeSessionHandler.closeQuestion(socket, publicIO);
        } catch (error) {
            console.error("Failed to close question", error);

            if (error instanceof ZodError) {
                return socket.emit(SOCKET_EVENT.NEXT_QUESTION, {
                    status: "error",
                    error: JSON.parse(error.message),
                });
            }

            if (error instanceof Error) {
                return socket.emit(SOCKET_EVENT.NEXT_QUESTION, {
                    status: "error",
                    error: error.message,
                });
            }
        }
    });

    socket.on(SOCKET_EVENT.END_SESSION, async (message) => {
        try {
            const { sessionId } = EndSessionMessageSchema.parse(message);

            sessions.delete(sessionId);

            socket.emit(SOCKET_EVENT.END_SESSION, {
                status: "ok",
            });
        } catch (error) {
            console.error("Failed to end session", error);

            if (error instanceof ZodError) {
                return socket.emit(SOCKET_EVENT.END_SESSION, {
                    status: "error",
                    error: JSON.parse(error.message),
                });
            }

            if (error instanceof Error) {
                return socket.emit(SOCKET_EVENT.END_SESSION, {
                    status: "error",
                    error: error.message,
                });
            }
        }
    });
});

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});
