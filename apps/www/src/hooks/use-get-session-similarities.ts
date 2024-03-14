import { api } from "~/trpc/react";

export function useGetSessionSimilarities(sessionId: string) {
    const similaritiesQuery = api.similarity.getSessionSimilarities.useQuery(
        {
            sessionId,
        },
        {
            refetchInterval: 1000 * 5,
        },
    );

    return similaritiesQuery;
}
