ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_session_id_name_unique" UNIQUE("session_id","name");