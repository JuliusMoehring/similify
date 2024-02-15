import { type useSearchParams } from "next/navigation";
import { z } from "zod";

export const SEARCH_PARAMS = {
    SESSION_ID: "sessionId",
    CODE: "code",
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

const SessionIdSchema = z.string().nullable();

export function validateSessionId(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const page = searchParams.get(SEARCH_PARAMS.SESSION_ID);

    return validateSearchParam(page, SessionIdSchema);
}

const CodeSchema = z.string().nullable();

export function validateCode(searchParams: ReturnType<typeof useSearchParams>) {
    const code = searchParams.get(SEARCH_PARAMS.CODE);

    return validateSearchParam(code, CodeSchema);
}

const EditModeSchema = z.coerce.boolean().default(false);

export function validateIsEditMode(
    searchParams: ReturnType<typeof useSearchParams>,
) {
    const editMode = searchParams.get(SEARCH_PARAMS.EDIT_MODE);

    return validateSearchParam(editMode, EditModeSchema);
}
