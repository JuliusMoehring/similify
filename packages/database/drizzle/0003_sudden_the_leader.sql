ALTER TABLE "custom_question_options" DROP CONSTRAINT "custom_question_options_question_id_custom_questions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_options" ADD CONSTRAINT "custom_question_options_question_id_custom_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "custom_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
