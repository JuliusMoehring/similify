CREATE UNIQUE INDEX IF NOT EXISTS "attendee_similarities_attendee_id_similar_attendee_id_index" ON "attendee_similarities" ("attendee_id","similar_attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_question_answer_similarity_session_id_index" ON "custom_question_answer_similarity" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_question_answer_similarity_question_id_index" ON "custom_question_answer_similarity" ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "custom_question_answer_similarity_attendee_id_similar_attendee_id_index" ON "custom_question_answer_similarity" ("attendee_id","similar_attendee_id");