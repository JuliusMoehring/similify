export const ERROR_MAP = {
    USERNAME_ALREADY_TAKEN: "USERNAME_ALREADY_TAKEN",
    INVALID_SPOTIFY_AUTHORIZATION: "INVALID_SPOTIFY_AUTHORIZATION",
} as const;

export type ErrorCode = keyof typeof ERROR_MAP;

export const ERROR_MESSAGES = {
    [ERROR_MAP.USERNAME_ALREADY_TAKEN]:
        "There is already an attendee with that username.",
    [ERROR_MAP.INVALID_SPOTIFY_AUTHORIZATION]:
        "Invalid Spotify authorization code.",
} as const;
