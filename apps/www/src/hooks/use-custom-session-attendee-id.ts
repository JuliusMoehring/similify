import { z } from "zod";

import { usePersistedState } from "./use-persisted-state";

export function useCustomSessionAttendeeId(
    sessionId: string,
    attendeeId: string | null = null,
) {
    return usePersistedState(
        z.string(),
        `session-attendee-id:${sessionId}`,
        attendeeId,
    );
}
