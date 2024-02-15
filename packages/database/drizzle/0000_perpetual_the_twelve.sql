CREATE TABLE IF NOT EXISTS "custom_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"question" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_question_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_question_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_attendees_session_id_name_unique" UNIQUE("session_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "similarities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"attendee_id" uuid NOT NULL,
	"similar_attendee_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendee_to_spotify_artists" (
	"attendee_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"artist_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendee_to_spotify_artists_attendee_id_artist_id_unique" UNIQUE("attendee_id","artist_id")
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
CREATE TABLE IF NOT EXISTS "attendee_to_spotify_tracks" (
	"attendee_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"track_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendee_to_spotify_tracks_attendee_id_track_id_unique" UNIQUE("attendee_id","track_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "spotify_artists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"popularity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE IF NOT EXISTS "spotify_tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"popularity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_idx" ON "session_attendees" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "similarities_session_id_index" ON "similarities" ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_artists_attendee_id_index" ON "attendee_to_spotify_artists" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_artists_artist_id_index" ON "attendee_to_spotify_artists" ("artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_genres_attendee_id_index" ON "attendee_to_spotify_genres" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_genres_genre_id_index" ON "attendee_to_spotify_genres" ("genre_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_tracks_attendee_id_index" ON "attendee_to_spotify_tracks" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_tracks_track_id_index" ON "attendee_to_spotify_tracks" ("track_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question" ADD CONSTRAINT "custom_question_type_id_custom_question_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "custom_question_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question" ADD CONSTRAINT "custom_question_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_question_option" ADD CONSTRAINT "custom_question_option_question_id_custom_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "custom_question"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
 ALTER TABLE "attendee_to_spotify_artists" ADD CONSTRAINT "attendee_to_spotify_artists_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_artists" ADD CONSTRAINT "attendee_to_spotify_artists_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_artists" ADD CONSTRAINT "attendee_to_spotify_artists_artist_id_spotify_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "spotify_artists"("id") ON DELETE no action ON UPDATE no action;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_tracks" ADD CONSTRAINT "attendee_to_spotify_tracks_attendee_id_session_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "session_attendees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_tracks" ADD CONSTRAINT "attendee_to_spotify_tracks_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendee_to_spotify_tracks" ADD CONSTRAINT "attendee_to_spotify_tracks_track_id_spotify_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "spotify_tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
