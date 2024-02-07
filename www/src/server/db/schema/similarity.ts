import { relations, sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { attendees, sessions } from "./session";

export const similarities = pgTable(
    "similarities",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        sessionId: uuid("session_id")
            .notNull()
            .references(() => sessions.id),
        attendeeId: uuid("attendee_id")
            .notNull()
            .references(() => attendees.id),
        similarAttendeeId: uuid("similar_attendee_id")
            .notNull()
            .references(() => attendees.id),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            sessionIdx: index().on(table.sessionId),
        };
    },
);

export const similarityRelations = relations(similarities, ({ one }) => ({
    session: one(sessions, {
        fields: [similarities.sessionId],
        references: [sessions.id],
    }),
    attendee: one(attendees, {
        fields: [similarities.attendeeId],
        references: [attendees.id],
    }),
    similarAttendee: one(attendees, {
        fields: [similarities.similarAttendeeId],
        references: [attendees.id],
    }),
}));
