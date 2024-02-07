import { type useSearchParams } from "next/navigation";
import { z } from "zod";

export const SEARCH_PARAMS = {
    SESSION_ID: "sessionId",
} as const;

class InvalidSearchParameterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidSearchParameterError";
    }
}

const SessionIdSchema = z.string().nullable();

export function validateSessionID(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const page = searchParams.get(SEARCH_PARAMS.SESSION_ID);

    const result = SessionIdSchema.safeParse(page);

    if (!result.success) {
        throw new InvalidSearchParameterError(
            `${JSON.stringify(result.error.flatten())}`,
        );
    }

    return result.data;
}
