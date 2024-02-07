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

);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_idx" ON "attendee_to_spotify_tracks" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "track_idx" ON "attendee_to_spotify_tracks" ("track_id");--> statement-breakpoint
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
