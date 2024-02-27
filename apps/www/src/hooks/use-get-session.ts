import { api } from "~/trpc/react";
import { useHandleTRPCError } from "./use-handle-trpc-error";

export function useGetSession(sessionId: string) {
    const sessionQuery = api.session.getSession.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        sessionQuery,
        "Failed to load session",
        "Failed to load session",
    );

    return sessionQuery;
}
