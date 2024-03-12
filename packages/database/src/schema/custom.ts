import { relations, sql } from "drizzle-orm";
import {
    integer,
    pgTable,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";

import { attendees, sessions } from "./session";

export const customQuestions = pgTable("custom_questions", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),

    sessionId: uuid("session_id")
        .references(() => sessions.id)
        .notNull(),

    question: text("question").notNull(),
    type: text("type").notNull(),
    order: integer("order").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customQuestionOptions = pgTable("custom_question_options", {
    id: uuid("id")
        .primaryKey()
        .default(sql`gen_random_uuid()`),

    questionId: uuid("question_id")
        .references(() => customQuestions.id, { onDelete: "cascade" })
        .notNull(),

    option: text("option").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customQuestionAnswer = pgTable(
    "custom_question_answers",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`gen_random_uuid()`),

        sessionId: uuid("session_id")
            .references(() => sessions.id)
            .notNull(),
        questionId: uuid("question_id")
            .references(() => customQuestions.id)
            .notNull(),
        attendeeId: uuid("attendee_id")
            .references(() => attendees.id)
            .notNull(),

        answer: text("answer").notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => {
        return {
            uniqueAnswer: unique().on(
                table.sessionId,
                table.questionId,
                table.attendeeId,
            ),
        };
    },
);

export const customQuestionRelations = relations(
    customQuestions,
    ({ one, many }) => ({
        session: one(sessions, {
            fields: [customQuestions.sessionId],
            references: [sessions.id],
        }),
        options: many(customQuestionOptions),
    }),
);

export const customQuestionOptionRelations = relations(
    customQuestionOptions,
    ({ one }) => ({
        question: one(customQuestions, {
            fields: [customQuestionOptions.questionId],
            references: [customQuestions.id],
        }),
    }),
);

export const customQuestionAnswerRelations = relations(
    customQuestionAnswer,
    ({ one }) => ({
        session: one(sessions, {
            fields: [customQuestionAnswer.sessionId],
            references: [sessions.id],
        }),
        question: one(customQuestions, {
            fields: [customQuestionAnswer.questionId],
            references: [customQuestions.id],
        }),
        attendee: one(attendees, {
            fields: [customQuestionAnswer.attendeeId],
            references: [attendees.id],
        }),
    }),
);
