import { CreateSessionForm } from "~/components/session/create-session-form";

export default function Dashboard() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Create new session</h2>

            <p className="text-muted-foreground">
                After creating a new session, you can invite friends to join
                your session. Based on the session type you have choosen, the
                similarity of all members will be calculated and displayed.
            </p>

            <CreateSessionForm />
        </div>
    );
}
