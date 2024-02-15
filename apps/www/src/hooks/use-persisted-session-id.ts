import { z } from "zod";

import { usePersistedState } from "./use-persisted-state";

export function usePersistedSessionId(sessionId: string | null = null) {
    return usePersistedState(z.string().uuid(), "session-id", sessionId);
}
