CREATE TABLE IF NOT EXISTS "custom_question_answer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"attendee_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_question_answer_session_id_question_id_attendee_id_unique" UNIQUE("session_id","question_id","attendee_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer" ADD CONSTRAINT "custom_question_answer_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer" ADD CONSTRAINT "custom_question_answer_question_id_custom_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "custom_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer" ADD CONSTRAINT "custom_question_answer_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
