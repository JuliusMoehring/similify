import { type useSearchParams } from "next/navigation";
import { z } from "zod";

export const SEARCH_PARAMS = {
    SESSION_ID: "sessionId",
    CODE: "code",
    SPOTIFY_AUTHORIZATION_ERROR: "error",
    EDIT_MODE: "editMode",
} as const;

class InvalidSearchParameterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidSearchParameterError";
    }
}

function validateSearchParam<Z extends z.ZodTypeAny = z.ZodNever>(
    value: string | string[] | null,
    schema: Z,
) {
    const result = schema.safeParse(value);

    if (!result.success) {
        throw new InvalidSearchParameterError(
            `${JSON.stringify(result.error.flatten())}`,
        );
    }

    return result.data as z.infer<Z>;
}

export function validateRequiredSessionId(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const sessionId = searchParams.get(SEARCH_PARAMS.SESSION_ID);

    return validateSearchParam(sessionId, z.string().uuid());
}

export function validateSessionId(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const sessionId = searchParams.get(SEARCH_PARAMS.SESSION_ID);

    return validateSearchParam(sessionId, z.string().uuid().nullable());
}

export function validateCode(searchParams: ReturnType<typeof useSearchParams>) {
    const code = searchParams.get(SEARCH_PARAMS.CODE);

    return validateSearchParam(code, z.string().nullable());
}

export function validateSpotifyAuthorizationError(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const error = searchParams.get(SEARCH_PARAMS.SPOTIFY_AUTHORIZATION_ERROR);

    return validateSearchParam(error, z.string().nullable());
}

export function validateIsEditMode(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const editMode = searchParams.get(SEARCH_PARAMS.EDIT_MODE);

    return validateSearchParam(editMode, z.coerce.boolean().default(false));
}
