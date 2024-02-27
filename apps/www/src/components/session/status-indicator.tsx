import { SessionStatusType } from "~/lib/session-status";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { SESSION_ICON_MAP } from "./status-icons";

type SessionStatusIndicatorProps = {
    status: SessionStatusType;
};

export function SessionStatusIndicator({
    status,
}: SessionStatusIndicatorProps) {
    const Icon = SESSION_ICON_MAP[status];

    return (
        <Alert>
            <Icon className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                You can add components to your app using the cli.
            </AlertDescription>
        </Alert>
    );
}
