import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SESSION_STATUS, SessionStatusType } from "~/lib/session-status";
import { ChevronDownIcon } from "lucide-react";
import {
    SessionStatusFinishedIcon,
    SessionStatusInProgressIcon,
    SessionStatusPlannedIcon,
} from "./status-icons";

type UpdateSessionStatusButtonProps = {
    sessionId: string;
    align?: "start" | "center" | "end";
};

export function UpdateSessionStatusButton({
    sessionId,
    align = "end",
}: UpdateSessionStatusButtonProps) {
    const utils = api.useUtils();
    const updateSessionStatusMutation =
        api.session.updateSessionStatus.useMutation();

    const handleUpdateSessionStatus = async (status: SessionStatusType) => {
        try {
            await updateSessionStatusMutation.mutateAsync({
                sessionId,
                status,
            });

            await utils.session.getSession.invalidate({ sessionId });

            toast.success("Session status updated");
        } catch (error) {
            toast.error("Failed to update session status");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    Update session status
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                <DropdownMenuItem
                    onClick={() =>
                        handleUpdateSessionStatus(SESSION_STATUS.PLANNED)
                    }
                >
                    <SessionStatusPlannedIcon className="mr-2 h-4 w-4" />{" "}
                    Planned
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        handleUpdateSessionStatus(SESSION_STATUS.IN_PROGRESS)
                    }
                >
                    <SessionStatusInProgressIcon className="mr-2 h-4 w-4" />
                    In progress
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        handleUpdateSessionStatus(SESSION_STATUS.FINISHED)
                    }
                >
                    <SessionStatusFinishedIcon className="mr-2 h-4 w-4" />{" "}
                    Finished
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
