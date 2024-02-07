import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/server/db";
import {
    attendeeToSpotifyArtists,
    attendeeToSpotifyGenres,
    attendeeToSpotifyTracks,
    spotifyArtists,
    spotifyGenres,
    spotifyTracks,
} from "~/server/db/schema/spotify";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const spotifyRouter = createTRPCRouter({
    loadTopTracks: publicProcedure
        .input(
            z.object({
                attendeeId: z.string(),
                sessionId: z.string(),
                access_token: z.string(),
                token_type: z.string(),
                expires_in: z.number(),
                refresh_token: z.string(),
                expires: z.number().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            const {
                attendeeId,
                sessionId,
                access_token,
                token_type,
                expires_in,
                refresh_token,
                expires,
            } = input;

            const spotify = SpotifyApi.withAccessToken(
                env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
                {
                    access_token,
                    token_type,
                    expires_in,
                    refresh_token,
                    expires,
                },
            );

            const topTracks = await spotify.currentUser.topItems(
                "tracks",
                undefined,
                50,
            );

            const values = topTracks.items.map((item) => {
                const id = item.id;
                const name = item.name;
                const image = item.album.images[0]?.url;
                const popularity = item.popularity;

                return { id, name, image, popularity };
            });

            await Promise.all(
                values.map(async (value) => {
                    await db
                        .insert(spotifyTracks)
                        .values(value)
                        .onConflictDoUpdate({
                            target: spotifyTracks.id,
                            set: {
                                name: value.name,
                                image: value.image,
                                popularity: value.popularity,
                            },
                        });
                }),
            );

            await Promise.all(
                values.map(async (value) => {
                    await db.insert(attendeeToSpotifyTracks).values({
                        attendeeId,
                        sessionId,
                        trackId: value.id,
                    });
                }),
            );

            return true;
        }),

    loadTopArtists: publicProcedure
        .input(
            z.object({
                attendeeId: z.string(),
                sessionId: z.string(),
                access_token: z.string(),
                token_type: z.string(),
                expires_in: z.number(),
                refresh_token: z.string(),
                expires: z.number().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            const {
                attendeeId,
                sessionId,
                access_token,
                token_type,
                expires_in,
                refresh_token,
                expires,
            } = input;

            const spotify = SpotifyApi.withAccessToken(
                env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
                {
                    access_token,
                    token_type,
                    expires_in,
                    refresh_token,
                    expires,
                },
            );

            const topArtistsResponse = await spotify.currentUser.topItems(
                "artists",
                undefined,
                50,
            );

            const topArtists = topArtistsResponse.items.map((item) => {
                const id = item.id;
                const name = item.name;
                const image = item.images[0]?.url;
                const popularity = item.popularity;

                return { id, name, image, popularity };
            });

            await Promise.all(
                topArtists.map(async (value) => {
                    await db
                        .insert(spotifyArtists)
                        .values(value)
                        .onConflictDoUpdate({
                            target: spotifyArtists.id,
                            set: {
                                name: value.name,
                                image: value.image,
                                popularity: value.popularity,
                            },
                        });
                }),
            );

            await Promise.all(
                topArtists.map(async (value) => {
                    await db.insert(attendeeToSpotifyArtists).values({
                        attendeeId,
                        sessionId,
                        artistId: value.id,
                    });
                }),
            );

            const topGenres = topArtistsResponse.items.reduce<
                { name: string }[]
            >((previous, current) => {
                const genres = current.genres;

                return [...previous, ...genres.map((name) => ({ name }))];
            }, []);

            const topGenresFromDatabase = await db
                .insert(spotifyGenres)
                .values(topGenres)
                .returning({
                    id: spotifyGenres.id,
                    name: spotifyGenres.name,
                })
                .onConflictDoNothing();

            await Promise.all(
                topGenresFromDatabase.map(async (value) => {
                    await db.insert(attendeeToSpotifyGenres).values({
                        attendeeId,
                        sessionId,
                        genreId: value.id,
                    });
                }),
            );

            return true;
        }),
});
