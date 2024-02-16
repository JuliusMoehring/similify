import { z } from "zod";

export const SOCKET_EVENT = {
    NEXT_QUESTION: "next-question",
    START_SESSION: "start-session",
    END_SESSION: "end-session",
    JOIN_SESSION: "join-session",
    LEAVE_SESSION: "leave-session",
} as const;

export const SocketEventSchema = z.enum([
    SOCKET_EVENT.NEXT_QUESTION,
    SOCKET_EVENT.START_SESSION,
    SOCKET_EVENT.END_SESSION,
    SOCKET_EVENT.JOIN_SESSION,
    SOCKET_EVENT.LEAVE_SESSION,
]);

export type SocketEventType = z.infer<typeof SocketEventSchema>;
