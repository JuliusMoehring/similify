ALTER TABLE "custom_question_answer" RENAME TO "custom_question_answers";--> statement-breakpoint
ALTER TABLE "custom_question_answers" DROP CONSTRAINT "custom_question_answer_session_id_question_id_attendee_id_unique";--> statement-breakpoint
ALTER TABLE "custom_question_answers" DROP CONSTRAINT "custom_question_answer_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "custom_question_answers" DROP CONSTRAINT "custom_question_answer_question_id_custom_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "custom_question_answers" DROP CONSTRAINT "custom_question_answer_attendee_id_session_attendees_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answers" ADD CONSTRAINT "custom_question_answers_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answers" ADD CONSTRAINT "custom_question_answers_question_id_custom_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "custom_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answers" ADD CONSTRAINT "custom_question_answers_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "custom_question_answers" ADD CONSTRAINT "custom_question_answers_session_id_question_id_attendee_id_unique" UNIQUE("session_id","question_id","attendee_id");