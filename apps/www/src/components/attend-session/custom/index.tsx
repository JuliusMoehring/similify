import { PublicSocketProvider } from "@contexts/public-socket";
import { Headline } from "~/components/ui/headline";

type AttendCustomSessionProps = {
    sessionId: string;
};

export function AttendCustomSession({ sessionId }: AttendCustomSessionProps) {
    return (
        <PublicSocketProvider sessionId={sessionId}>
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
                <Headline tag="h1" className="max-w-prose">
                    Waiting for host to activate the next question
                </Headline>

                <p className="text-muted-foreground max-w-prose">
                    Once the host activates the next question, you will be able
                    to answer it. After you have answered the question and the
                    host has closed the session, we will calculate the
                    similartity between the answers of all the participants and
                    show the results.
                </p>
            </div>
        </PublicSocketProvider>
    );
}
