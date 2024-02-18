import { SEARCH_PARAMS } from "./search-params";
import { SESSION_TYPE, SessionTypeType } from "./session-type";

const PATH_MAP = {
    [SESSION_TYPE.CUSTOM]: "/custom/join-session",
    [SESSION_TYPE.SPOTIFY]: "/spotify/authorize",
} as const;

export function constructInviteURL(type: SessionTypeType, sessionId: string) {
    const path = PATH_MAP[type];

    const inviteURL = new URL(`${window.location.origin}${path}`);

    inviteURL.searchParams.set(SEARCH_PARAMS.SESSION_ID, sessionId);

    return inviteURL.toString();
}
