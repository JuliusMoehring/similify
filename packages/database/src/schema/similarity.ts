import { relations, sql } from "drizzle-orm";
import {
    doublePrecision,
    index,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

import { customQuestions } from "./custom";
import { attendees, sessions } from "./session";

export const attendeeSimilarities = pgTable(
    "attendee_similarities",
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

        similarityValue: doublePrecision("similarity_value").notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            sessionIdx: index().on(table.sessionId),
            uniqueCombinationIdx: uniqueIndex().on(
                table.attendeeId,
                table.similarAttendeeId,
            ),
        };
    },
);

export const customQuestionAnswerSimilarity = pgTable(
    "custom_question_answer_similarity",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        sessionId: uuid("session_id")
            .notNull()
            .references(() => sessions.id),
        questionId: uuid("question_id")
            .notNull()
            .references(() => customQuestions.id),

        attendeeId: uuid("attendee_id")
            .notNull()
            .references(() => attendees.id),
        similarAttendeeId: uuid("similar_attendee_id")
            .notNull()
            .references(() => attendees.id),

        similarityValue: doublePrecision("similarity_value").notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            sessionIdx: index().on(table.sessionId),
            questionIdx: index().on(table.questionId),
            uniqueCombinationIdx: uniqueIndex().on(
                table.questionId,
                table.attendeeId,
                table.similarAttendeeId,
            ),
        };
    },
);

export const similarityRelations = relations(
    attendeeSimilarities,
    ({ one }) => ({
        session: one(sessions, {
            fields: [attendeeSimilarities.sessionId],
            references: [sessions.id],
        }),
        attendee: one(attendees, {
            fields: [attendeeSimilarities.attendeeId],
            references: [attendees.id],
        }),
        similarAttendee: one(attendees, {
            fields: [attendeeSimilarities.similarAttendeeId],
            references: [attendees.id],
        }),
    }),
);

export const customQuestionAnswerSimilarityRelations = relations(
    customQuestionAnswerSimilarity,
    ({ one }) => ({
        session: one(sessions, {
            fields: [customQuestionAnswerSimilarity.sessionId],
            references: [sessions.id],
        }),
        question: one(customQuestions, {
            fields: [customQuestionAnswerSimilarity.questionId],
            references: [customQuestions.id],
        }),
        attendee: one(attendees, {
            fields: [customQuestionAnswerSimilarity.attendeeId],
            references: [attendees.id],
        }),
        similarAttendee: one(attendees, {
            fields: [customQuestionAnswerSimilarity.similarAttendeeId],
            references: [attendees.id],
        }),
    }),
);
