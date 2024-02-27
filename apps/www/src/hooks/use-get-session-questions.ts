import { api } from "~/trpc/react";
import { useHandleTRPCError } from "./use-handle-trpc-error";

export function useGetSessionQuestions(sessionId: string) {
    const sessionQuestionsQuery = api.custom.getSessionQuestions.useQuery({
        sessionId,
    });

    useHandleTRPCError(
        sessionQuestionsQuery,
        "Failed to load session questions",
        "Failed to load session questions",
    );

    return sessionQuestionsQuery;
}
