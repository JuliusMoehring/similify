import { z } from "zod";

export const SESSION_STATUS = {
    PLANNED: "planned",
    IN_PROGRESS: "in_progress",
    FINISHED: "finished",
} as const;

export const SessionStatusSchema = z.enum([
    SESSION_STATUS.PLANNED,
    SESSION_STATUS.IN_PROGRESS,
    SESSION_STATUS.FINISHED,
]);

export type SessionStatusType = z.infer<typeof SessionStatusSchema>;
