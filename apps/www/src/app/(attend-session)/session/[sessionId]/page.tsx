"use client";

import { AttendCustomSession } from "~/components/attend-session/custom";
import { SESSION_TYPE } from "~/lib/session-type";
import { api } from "~/trpc/react";

export default function Session({ params }: { params: { sessionId: string } }) {
    const sessionId = params.sessionId;

    const sessionQuery = api.session.getPublicSession.useQuery({ sessionId });

    if (sessionQuery.isLoading) {
        return <div>Loading...</div>;
    }

    if (sessionQuery.isError) {
        return <div>Error: {sessionQuery.error.message}</div>;
    }

    if (sessionQuery.data.type === SESSION_TYPE.CUSTOM) {
        return <AttendCustomSession sessionId={sessionId} />;
    }

    return null;
}
