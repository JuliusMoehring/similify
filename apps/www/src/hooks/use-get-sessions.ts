import { api } from "~/trpc/react";
import { useHandleTRPCError } from "./use-handle-trpc-error";

export function useGetSessions() {
    const sessionsQuery = api.session.getSessions.useQuery();

    useHandleTRPCError(
        sessionsQuery,
        "Failed to load sessions",
        "Failed to load sessions",
    );

    return sessionsQuery;
}
