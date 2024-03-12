"use client";

import { SimilarityGraph } from "~/components/similarity/graph";
import { useGetSessionSimilarities } from "~/hooks/use-get-session-similarities";

export default function SessionGraphPage({
    params,
}: {
    params: { sessionId: string };
}) {
    const sessionId = params.sessionId;

    const similaritiesQuery = useGetSessionSimilarities(sessionId);

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
