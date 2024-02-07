CREATE TABLE IF NOT EXISTS "similarities" (
	"id" uuid PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"session_id" uuid NOT NULL,
	"attendee_id" uuid NOT NULL,
	"similar_attendee_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendee_to_spotify_genres" (
	"attendee_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendee_to_spotify_genres_attendee_id_genre_id_unique" UNIQUE("attendee_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spotify_genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "spotify_genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "similarities_session_id_index" ON "similarities" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_genres_attendee_id_index" ON "attendee_to_spotify_genres" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_genres_genre_id_index" ON "attendee_to_spotify_genres" ("genre_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "similarities" ADD CONSTRAINT "similarities_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "similarities" ADD CONSTRAINT "similarities_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "similarities" ADD CONSTRAINT "similarities_similar_attendee_id_session_attendees_id_fk" FOREIGN KEY ("similar_attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_genres" ADD CONSTRAINT "attendee_to_spotify_genres_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_genres" ADD CONSTRAINT "attendee_to_spotify_genres_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_genres" ADD CONSTRAINT "attendee_to_spotify_genres_genre_id_spotify_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "spotify_genres"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
