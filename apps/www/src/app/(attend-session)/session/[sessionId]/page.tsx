"use client";

import { api } from "~/trpc/react";

export default function Session({ params }: { params: { sessionId: string } }) {
    const sessionId = params.sessionId;

    const sessionQuery = api.session.getPublicSession.useQuery({ sessionId });

    if (sessionQuery.isLoading) {
        return <div>Loading...</div>;
    }

    return <div>Session</div>;
}
