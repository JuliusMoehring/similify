export const ERROR_MAP = {
    USERNAME_ALREADY_TAKEN: "USERNAME_ALREADY_TAKEN",
};

export type ErrorCode = keyof typeof ERROR_MAP;

export const ERROR_MESSAGES = {
    [ERROR_MAP.USERNAME_ALREADY_TAKEN]:
        "There is already an attendee with that username.",
};
