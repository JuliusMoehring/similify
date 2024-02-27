import { api } from "~/trpc/react";
import { useHandleTRPCError } from "./use-handle-trpc-error";

export function useGetQuestionAnswerCount(
    sessionId: string,
    questionId: string | undefined,
) {
    const questionAnswerCountQuery =
        api.custom.getSessionQuestionAnswerCount.useQuery(
            {
                sessionId,
                questionId: questionId!,
            },
            {
                enabled: Boolean(questionId),
                refetchInterval: 5 * 1000,
            },
        );

    useHandleTRPCError(
        questionAnswerCountQuery,
        "Failed to load question answer count",
        "Failed to load question answer count",
    );

    return questionAnswerCountQuery;
}
