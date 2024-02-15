import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { attendees, sessions } from "./session";

export const spotifyTracks = pgTable("spotify_tracks", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  image: text("image"),
  popularity: integer("popularity").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spotifyTrackRelations = relations(spotifyTracks, ({ many }) => ({
  attendees: many(attendeeToSpotifyTracks),
}));

export const attendeeToSpotifyTracks = pgTable(
  "attendee_to_spotify_tracks",
  {
    attendeeId: uuid("attendee_id")
      .references(() => attendees.id)
      .notNull(),
    sessionId: uuid("session_id")
      .references(() => sessions.id)
      .notNull(),
    trackId: text("track_id")
      .references(() => spotifyTracks.id)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      attendeeIdx: index().on(table.attendeeId),
      trackIdx: index().on(table.trackId),
      uniqueAttendeeTrack: unique().on(table.attendeeId, table.trackId),
    };
  },
);

export const attendeeToSpotifyTrackRelations = relations(
  attendeeToSpotifyTracks,
  ({ one }) => ({
    attendee: one(attendees, {
      fields: [attendeeToSpotifyTracks.attendeeId],
      references: [attendees.id],
    }),
    session: one(sessions, {
      fields: [attendeeToSpotifyTracks.sessionId],
      references: [sessions.id],
    }),
    track: one(spotifyTracks, {
      fields: [attendeeToSpotifyTracks.trackId],
      references: [spotifyTracks.id],
    }),
  }),
);

export const spotifyArtists = pgTable("spotify_artists", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  image: text("image"),
  popularity: integer("popularity").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const spotifyArtistRelations = relations(spotifyArtists, ({ many }) => ({
  attendees: many(attendeeToSpotifyArtists),
}));

export const attendeeToSpotifyArtists = pgTable(
  "attendee_to_spotify_artists",
  {
    attendeeId: uuid("attendee_id")
      .references(() => attendees.id)
      .notNull(),
    sessionId: uuid("session_id")
      .references(() => sessions.id)
      .notNull(),
    artistId: text("artist_id")
      .references(() => spotifyArtists.id)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      attendeeIdx: index().on(table.attendeeId),
      artistIdx: index().on(table.artistId),
      uniqueAttendeeArtist: unique().on(table.attendeeId, table.artistId),
    };
  },
);

export const attendeeToSpotifyArtistRelations = relations(
  attendeeToSpotifyArtists,
  ({ one }) => ({
    attendee: one(attendees, {
      fields: [attendeeToSpotifyArtists.attendeeId],
      references: [attendees.id],
    }),
    session: one(sessions, {
      fields: [attendeeToSpotifyArtists.sessionId],
      references: [sessions.id],
    }),
    artist: one(spotifyArtists, {
      fields: [attendeeToSpotifyArtists.artistId],
      references: [spotifyArtists.id],
    }),
  }),
);

export const spotifyGenres = pgTable(
  "spotify_genres",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").unique().notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export const spotifyGenreRelations = relations(spotifyGenres, ({ many }) => ({
  attendees: many(attendeeToSpotifyGenres),
}));

export const attendeeToSpotifyGenres = pgTable(
  "attendee_to_spotify_genres",
  {
    attendeeId: uuid("attendee_id")
      .references(() => attendees.id)
      .notNull(),
    sessionId: uuid("session_id")
      .references(() => sessions.id)
      .notNull(),
    genreId: uuid("genre_id")
      .references(() => spotifyGenres.id)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      attendeeIdx: index().on(table.attendeeId),
      genreIdx: index().on(table.genreId),
      uniqueAttendeeGenre: unique().on(table.attendeeId, table.genreId),
    };
  },
);

export const attendeeToSpotifyGenreRelations = relations(
  attendeeToSpotifyGenres,
  ({ one }) => ({
    attendee: one(attendees, {
      fields: [attendeeToSpotifyGenres.attendeeId],
      references: [attendees.id],
    }),
    session: one(sessions, {
      fields: [attendeeToSpotifyGenres.sessionId],
      references: [sessions.id],
    }),
    genre: one(spotifyGenres, {
      fields: [attendeeToSpotifyGenres.genreId],
      references: [spotifyGenres.id],
    }),
  }),
);
