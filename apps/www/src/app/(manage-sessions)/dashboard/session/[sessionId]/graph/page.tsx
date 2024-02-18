"use client";

import { SimilarityGraph } from "~/components/similarity/graph";
import { api } from "~/trpc/react";

export default function SessionGraphPage({
    params,
}: {
    params: { sessionId: string };
}) {
    const sessionId = params.sessionId;

    const similaritiesQuery = api.similarity.getSessionSimilarities.useQuery({
        sessionId,
    });

    if (similaritiesQuery.isLoading) {
        return null;
    }

    if (similaritiesQuery.isError) {
        return <div>Error: {similaritiesQuery.error.message}</div>;
    }

    return (
        <SimilarityGraph
            nodes={similaritiesQuery.data.nodes}
            links={similaritiesQuery.data.links}
        />
    );
}
