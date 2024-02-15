import { z } from "zod";

export const SESSION_TYPE = {
    CUSTOM: "custom",
    SPOTIFY: "spotify",
};

export const SessionTypeSchema = z.enum([
    SESSION_TYPE.CUSTOM,
    SESSION_TYPE.SPOTIFY,
]);

export type SessionTypeType = z.infer<typeof SessionTypeSchema>;

export const SESSION_TYPE_DESCRIPTIONS = {
    [SESSION_TYPE.CUSTOM]:
        "Custom sessions allow you to create your own questions. Currently custom session can have open questions, and single/multiple choice questions. You can add questions to a custom session after creating it.",
    [SESSION_TYPE.SPOTIFY]:
        "Spotify sessions use the top songs, artists, and genres of the attendees to calculate the similartity between all attendees.",
};
