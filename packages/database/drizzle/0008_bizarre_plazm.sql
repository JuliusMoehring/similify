CREATE TABLE IF NOT EXISTS "custom_question_answer_similarity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"attendee_id" uuid NOT NULL,
	"similar_attendee_id" uuid NOT NULL,
	"similarity_value" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "similarities" RENAME TO "attendee_similarities";--> statement-breakpoint
ALTER TABLE "attendee_similarities" DROP CONSTRAINT "similarities_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "attendee_similarities" DROP CONSTRAINT "similarities_attendee_id_session_attendees_id_fk";
--> statement-breakpoint
ALTER TABLE "attendee_similarities" DROP CONSTRAINT "similarities_similar_attendee_id_session_attendees_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "similarities_session_id_index";--> statement-breakpoint
ALTER TABLE "attendee_similarities" ALTER COLUMN "similarity_value" SET DATA TYPE double precision;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_similarities_session_id_index" ON "attendee_similarities" ("session_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_similarities" ADD CONSTRAINT "attendee_similarities_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_similarities" ADD CONSTRAINT "attendee_similarities_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_similarities" ADD CONSTRAINT "attendee_similarities_similar_attendee_id_session_attendees_id_fk" FOREIGN KEY ("similar_attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer_similarity" ADD CONSTRAINT "custom_question_answer_similarity_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer_similarity" ADD CONSTRAINT "custom_question_answer_similarity_question_id_custom_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "custom_questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer_similarity" ADD CONSTRAINT "custom_question_answer_similarity_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_answer_similarity" ADD CONSTRAINT "custom_question_answer_similarity_similar_attendee_id_session_attendees_id_fk" FOREIGN KEY ("similar_attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
