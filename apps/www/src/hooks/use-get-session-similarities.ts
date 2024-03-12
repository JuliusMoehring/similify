import { api } from "~/trpc/react";

export function useGetSessionSimilarities(sessionId: string) {
    const similaritiesQuery = api.similarity.getSessionSimilarities.useQuery(
        {
            sessionId,
        },
        {
            staleTime: 1000 * 60,
        },
    );

    return similaritiesQuery;
}
