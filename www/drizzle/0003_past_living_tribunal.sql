CREATE TABLE IF NOT EXISTS "attendee_to_spotify_artists" (
	"attendee_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"artist_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "attendee_to_spotify_artists_attendee_id_artist_id_unique" UNIQUE("attendee_id","artist_id")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "attendee_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "track_idx";--> statement-breakpoint
ALTER TABLE "spotify_artists" ADD COLUMN "id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "spotify_artists" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "spotify_artists" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "spotify_artists" ADD COLUMN "popularity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "spotify_artists" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "spotify_artists" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_artists_attendee_id_index" ON "attendee_to_spotify_artists" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_artists_artist_id_index" ON "attendee_to_spotify_artists" ("artist_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_tracks_attendee_id_index" ON "attendee_to_spotify_tracks" ("attendee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendee_to_spotify_tracks_track_id_index" ON "attendee_to_spotify_tracks" ("track_id");--> statement-breakpoint
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
