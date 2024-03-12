"use client";

import { AttendCustomSession } from "~/components/attend-session/custom";
import { Headline } from "~/components/ui/headline";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { SESSION_STATUS } from "~/lib/session-status";
import { SESSION_TYPE } from "~/lib/session-type";
import { api } from "~/trpc/react";

export default function Session({ params }: { params: { sessionId: string } }) {
    const sessionId = params.sessionId;

    const sessionQuery = api.session.getPublicSession.useQuery(
        { sessionId },
        {
            refetchInterval: 5 * 1000,
        },
    );

    if (sessionQuery.isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <LoadingSpinner className="h-10 w-10" />
            </div>
        );
    }

    if (sessionQuery.isError) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-red-600">
                    Error: {sessionQuery.error.message}
                </p>
            </div>
        );
    }

    if (sessionQuery.data.status === SESSION_STATUS.PLANNED) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-8 text-center">
                <Headline tag="h1">Session has not started yet</Headline>
                <p>Please wait for the host to start the session.</p>
            </div>
        );
    }

    if (sessionQuery.data.status === SESSION_STATUS.FINISHED) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-8 text-center">
                <Headline tag="h1">Session ended</Headline>
                <p>Thanks for participating in the session.</p>
            </div>
        );
    }

    if (sessionQuery.data.type === SESSION_TYPE.CUSTOM) {
        return <AttendCustomSession sessionId={sessionId} />;
    }

    return null;
}
