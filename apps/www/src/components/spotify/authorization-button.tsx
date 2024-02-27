import { env } from "~/env";
import { ExternalLinkButton } from "../ui/link-button";

export function SpotifyAuthorizationButton() {
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
    url.searchParams.append("show_dialog", "true");
    url.searchParams.append(
        "redirect_uri",
        `${env.NEXT_PUBLIC_BASE_URL}/spotify/authorize/callback`,
    );

    url.searchParams.sort();

    return (
        <ExternalLinkButton href={url.toString()} className="w-full bg-spotify">
            Authorize Spotify Access
        </ExternalLinkButton>
    );
}
