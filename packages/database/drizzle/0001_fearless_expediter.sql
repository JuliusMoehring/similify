DROP TABLE "custom_question_type";--> statement-breakpoint
ALTER TABLE "custom_question" DROP CONSTRAINT "custom_question_type_id_custom_question_type_id_fk";
--> statement-breakpoint
ALTER TABLE "custom_question" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "custom_question" DROP COLUMN IF EXISTS "type_id";