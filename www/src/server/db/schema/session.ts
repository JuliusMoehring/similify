import { relations, sql } from "drizzle-orm";
import {
    index,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

import {
    attendeeToSpotifyArtists,
    attendeeToSpotifyGenres,
    attendeeToSpotifyTracks,
} from "./spotify";

export const sessionTypes = pgTable("session_types", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),

    creatorId: text("user_id").notNull(),
    typeId: uuid("type_id")
        .references(() => sessionTypes.id)
        .notNull(),

    name: text("name").notNull(),

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

export const sessionTypeRelations = relations(sessionTypes, ({ many }) => ({
    sessions: many(sessions),
}));

export const sessionRelations = relations(sessions, ({ one, many }) => ({
    type: one(sessionTypes, {
        fields: [sessions.typeId],
        references: [sessionTypes.id],
    }),
    attendees: many(attendees),
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
