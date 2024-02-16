import { relations, sql } from "drizzle-orm";
import {
    index,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

import { customQuestions } from "./custom";
import {
    attendeeToSpotifyArtists,
    attendeeToSpotifyGenres,
    attendeeToSpotifyTracks,
} from "./spotify";

export const sessions = pgTable("sessions", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),

    creatorId: text("user_id").notNull(),

    name: text("name").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attendees = pgTable(
    "session_attendees",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        session_id: uuid("session_id").notNull(),

        name: text("name").notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            unqiueSessionName: unique().on(table.session_id, table.name),
            sessionIdx: index("session_idx").on(table.session_id),
        };
    },
);

export const sessionRelations = relations(sessions, ({ many }) => ({
    attendees: many(attendees),
    questions: many(customQuestions),
}));

export const attendeeRelations = relations(attendees, ({ one, many }) => ({
    session: one(sessions, {
        fields: [attendees.session_id],
        references: [sessions.id],
    }),
    topTracks: many(attendeeToSpotifyTracks),
    topArtists: many(attendeeToSpotifyArtists),
    topGenres: many(attendeeToSpotifyGenres),
}));
