ALTER TABLE "custom_question_option" RENAME TO "custom_question_options";--> statement-breakpoint
ALTER TABLE "custom_question" RENAME TO "custom_questions";--> statement-breakpoint
ALTER TABLE "custom_question_options" DROP CONSTRAINT "custom_question_option_question_id_custom_question_id_fk";
--> statement-breakpoint
ALTER TABLE "custom_questions" DROP CONSTRAINT "custom_question_session_id_sessions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_options" ADD CONSTRAINT "custom_question_options_question_id_custom_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "custom_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_questions" ADD CONSTRAINT "custom_questions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
