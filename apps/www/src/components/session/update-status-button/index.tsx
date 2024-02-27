import { Skeleton } from "~/components/ui/skeleton";
import { useGetSession } from "~/hooks/use-get-session";
import { SESSION_STATUS } from "~/lib/session-status";
import { EndSessionButton } from "./end-session";
import { StartSessionButton } from "./start-session";

type UpdateSessionStatusButtonProps = {
    sessionId: string;
};

export function UpdateSessionStatusButton({
    sessionId,
}: UpdateSessionStatusButtonProps) {
    const sessionQuery = useGetSession(sessionId);

    if (sessionQuery.isLoading) {
        return <Skeleton className="h-8 w-60" />;
    }

    if (sessionQuery.isError) {
        return null;
    }

    const { status } = sessionQuery.data;

    if (status === SESSION_STATUS.PLANNED) {
        return <StartSessionButton sessionId={sessionId} />;
    }

    if (status === SESSION_STATUS.IN_PROGRESS) {
        return <EndSessionButton sessionId={sessionId} />;
    }

    return null;
}
