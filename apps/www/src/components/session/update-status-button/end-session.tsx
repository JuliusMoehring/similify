import { useState } from "react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useAdminSocket } from "~/contexts/admin-socket";
import { useGetSession } from "~/hooks/use-get-session";
import { SESSION_STATUS } from "~/lib/session-status";
import { SESSION_TYPE } from "~/lib/session-type";
import { api } from "~/trpc/react";

type EndSessionButtonProps = {
    sessionId: string;
};

export function EndSessionButton({ sessionId }: EndSessionButtonProps) {
    const [isEndSessionDialogOpen, setIsEndSessionDialogOpen] = useState(false);

    const [showLoadingState, setShowLoadingState] = useState(false);

    const { endSession } = useAdminSocket();

    const utils = api.useUtils();

    const sessionQuery = useGetSession(sessionId);

    const updateSessionStatusMutation =
        api.session.updateSessionStatus.useMutation();

    const handleEndSession = async () => {
        if (sessionQuery.data?.type === SESSION_TYPE.CUSTOM) {
            endSession(sessionId);
        }

        try {
            setShowLoadingState(true);

            await updateSessionStatusMutation.mutateAsync({
                sessionId,
                status: SESSION_STATUS.FINISHED,
            });

            await utils.session.getSession.invalidate({ sessionId });

            setShowLoadingState(false);
            setIsEndSessionDialogOpen(false);

            toast.success("Session status updated");
        } catch (error) {
            setShowLoadingState(false);
            setIsEndSessionDialogOpen(false);

            toast.error("Failed to update session status");
        }
    };

    return (
        <AlertDialog
            open={isEndSessionDialogOpen}
            onOpenChange={setIsEndSessionDialogOpen}
        >
            <AlertDialogTrigger asChild>
                <Button variant="destructive">End session</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to end this session?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Session can only be started once. You can not undo this
                        action.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <Button
                        onClick={() => setIsEndSessionDialogOpen(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleEndSession}
                        variant="destructive"
                        disabled={showLoadingState}
                    >
                        {showLoadingState ? "Ending session..." : "End session"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
