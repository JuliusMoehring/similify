"use client";

import { CreateSessionForm } from "~/components/session/create-session-form";
import { ExternalLinkButton } from "~/components/ui/link-button";
import { env } from "~/env";

export default function Dashboard() {
    const url = new URL("https://accounts.spotify.com/authorize");

    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID);
    url.searchParams.append(
        "scope",
        [
            "user-read-email",
            "user-top-read",
            "user-read-recently-played",
            "user-follow-read",
        ].join(" "),
    );
    url.searchParams.append(
        "redirect_uri",
        "http://localhost:3000/api/authorize/callback",
    );
    url.searchParams.append("state", "123");

    return (
        <div className="space-y-4">
            <ExternalLinkButton href={url.toJSON()}>
                Click me
            </ExternalLinkButton>
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
