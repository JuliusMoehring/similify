import { useRouter } from "next/navigation";
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

type StartSessionButtonProps = {
    sessionId: string;
};

export function StartSessionButton({ sessionId }: StartSessionButtonProps) {
    const router = useRouter();

    const [isStartSessionDialogOpen, setIsStartSessionDialogOpen] =
        useState(false);

    const [showLoadingState, setShowLoadingState] = useState(false);

    const { startSession } = useAdminSocket();

    const utils = api.useUtils();

    const sessionQuery = useGetSession(sessionId);

    const updateSessionStatusMutation =
        api.session.updateSessionStatus.useMutation();

    const handleStartSession = async () => {
        if (sessionQuery.data?.type === SESSION_TYPE.CUSTOM) {
            startSession(sessionId);
        }

        try {
            setShowLoadingState(true);

            await updateSessionStatusMutation.mutateAsync({
                sessionId,
                status: SESSION_STATUS.IN_PROGRESS,
            });

            await utils.session.getSession.invalidate({ sessionId });

            setShowLoadingState(false);
            setIsStartSessionDialogOpen(false);

            toast.success("Session status updated");

            router.push(`/dashboard/session/${sessionId}/live`);
        } catch (error) {
            setShowLoadingState(false);
            setIsStartSessionDialogOpen(false);

            toast.error("Failed to update session status");
        }
    };

    return (
        <AlertDialog
            open={isStartSessionDialogOpen}
            onOpenChange={setIsStartSessionDialogOpen}
        >
            <AlertDialogTrigger asChild>
                <Button>Start session</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you sure you want to start this session?
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Session can only be started once. You can not undo this
                        action.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <Button
                        onClick={() => setIsStartSessionDialogOpen(false)}
                        variant="outline"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleStartSession}
                        disabled={showLoadingState}
                    >
                        {showLoadingState
                            ? "Starting session..."
                            : "Start session"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
