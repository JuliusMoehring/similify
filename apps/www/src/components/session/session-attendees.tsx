import { CopyIcon, UserCircleIcon } from "lucide-react";

import { useGetSessionAttendees } from "~/hooks/use-get-session-attendees";
import { Skeleton } from "../ui/skeleton";

type SessionAttendeesProps = {
    sessionId: string;
};

function getComponent(
    isLoading: boolean,
    isError: boolean,
    attendees: { id: string; name: string }[] | undefined,
) {
    if (isLoading) {
        return <SessionAttendeesLoading />;
    }

    if (isError) {
        return <SessionAttendeesError />;
    }

    if (!attendees || attendees.length === 0) {
        return <SessionAttendeesEmptyState />;
    }

    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {attendees.map(({ id, name }) => (
                <div
                    key={id}
                    className="border-muted flex items-center gap-2 rounded-md border px-4 py-2"
                >
                    <UserCircleIcon className="h-4 w-4" />
                    {name}
                </div>
            ))}
        </div>
    );
}

export function SessionAttendees({ sessionId }: SessionAttendeesProps) {
    const sessionAttendeesQuery = useGetSessionAttendees(sessionId);

    const hasSessionAttendees =
        sessionAttendeesQuery.data?.attendees &&
        sessionAttendeesQuery.data?.attendees.length > 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Attendees</h3>

                {sessionAttendeesQuery.isLoading && (
                    <Skeleton className="h-6 w-8" />
                )}

                {hasSessionAttendees && (
                    <span className="bg-muted rounded-sm px-2 py-1 text-xs tabular-nums">
                        {sessionAttendeesQuery.data?.attendees.length}
                    </span>
                )}
            </div>

            {getComponent(
                sessionAttendeesQuery.isLoading,
                sessionAttendeesQuery.isError,
                sessionAttendeesQuery.data?.attendees,
            )}
        </div>
    );
}

function SessionAttendeesEmptyState() {
    return (
        <>
            <p>
                No one has joined your session yet. Make sure to share the link
                above with the people you want to join your session.
            </p>

            <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                TIP: You can copy the invite link by clicking on the
                <CopyIcon className="h-3 w-3" />
                icon.
            </span>
        </>
    );
}

function SessionAttendeesLoading() {
    return <p>Loading attendees...</p>;
}

function SessionAttendeesError() {
    return <p>Failed to load attendees</p>;
}
