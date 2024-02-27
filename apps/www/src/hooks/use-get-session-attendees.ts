import { api } from "~/trpc/react";
import { useHandleTRPCError } from "./use-handle-trpc-error";

export function useGetSessionAttendees(sessionId: string) {
    const sessionAttendeesQuery = api.session.getSessionAttendees.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        sessionAttendeesQuery,
        "Failed to load session attendees",
        "Failed to load session attendees",
    );

    return sessionAttendeesQuery;
}
