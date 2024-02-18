import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import {
    attendeeToSpotifyArtists,
    attendeeToSpotifyGenres,
    attendeeToSpotifyTracks,
    spotifyArtists,
    spotifyGenres,
    spotifyTracks,
} from "database";
import { z, ZodError } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { ERROR_MAP } from "~/lib/error-map";

const SpotifyTokenResponse = z.object({
    access_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
    scope: z.string(),
});

export const spotifyRouter = createTRPCRouter({
    getToken: publicProcedure
        .input(z.object({ code: z.string() }))
        .mutation(async ({ input }) => {
            const { code } = input;

            try {
                const tokenResponse = await axios.post(
                    "https://accounts.spotify.com/api/token",
                    {
                        grant_type: "authorization_code",
                        code,
                        redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/spotify/authorize/callback`,
                    },
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization: `Basic ${Buffer.from(
                                `${env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
                            ).toString("base64")}`,
                        },
                    },
                );

                return SpotifyTokenResponse.parse(tokenResponse.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: ERROR_MAP.INVALID_SPOTIFY_AUTHORIZATION,
                    });
                }

                if (error instanceof ZodError) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message:
                            "Invalid response from Spotify, please try again.",
                    });
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "An unknown error occurred, please try again.",
                });
            }
        }),

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
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
            const {
                attendeeId,
                sessionId,
                access_token,
                token_type,
                expires_in,
                refresh_token,
                expires,
            } = input;

            try {
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
                    values.map((value) =>
                        db
                            .insert(spotifyTracks)
                            .values(value)
                            .onConflictDoUpdate({
                                target: spotifyTracks.id,
                                set: {
                                    name: value.name,
                                    image: value.image,
                                    popularity: value.popularity,
                                    updatedAt: new Date(),
                                },
                            }),
                    ),
                );

                await Promise.all(
                    values.map((value) =>
                        db.insert(attendeeToSpotifyTracks).values({
                            attendeeId,
                            sessionId,
                            trackId: value.id,
                        }),
                    ),
                );

                return true;
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not load top tracks from Spotify.",
                });
            }
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
        .mutation(async ({ ctx, input }) => {
            const { db } = ctx;
            const {
                attendeeId,
                sessionId,
                access_token,
                token_type,
                expires_in,
                refresh_token,
                expires,
            } = input;

            try {
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
                    const id = item.uri;
                    const name = item.name;
                    const image = item.images[0]?.url;
                    const popularity = item.popularity;

                    return { id, name, image, popularity };
                });

                await Promise.all(
                    topArtists.map((value) =>
                        db
                            .insert(spotifyArtists)
                            .values(value)
                            .onConflictDoUpdate({
                                target: spotifyArtists.id,
                                set: {
                                    name: value.name,
                                    image: value.image,
                                    popularity: value.popularity,
                                    updatedAt: new Date(),
                                },
                            }),
                    ),
                );

                await Promise.all(
                    topArtists.map(({ id }) =>
                        db.insert(attendeeToSpotifyArtists).values({
                            attendeeId,
                            sessionId,
                            artistId: id,
                        }),
                    ),
                );

                const topGenres = topArtistsResponse.items.reduce<
                    { name: string }[]
                >((previous, current) => {
                    const genres = current.genres;

                    return [...previous, ...genres.map((name) => ({ name }))];
                }, []);

                const uniqueTopGeneres = Array.from(
                    new Set(topGenres.map((value) => value.name)),
                );

                const spotifyGenresFromDatabase = await Promise.all(
                    uniqueTopGeneres.map((value) =>
                        db
                            .insert(spotifyGenres)
                            .values({ name: value })
                            .returning({
                                id: spotifyGenres.id,
                            })
                            .onConflictDoUpdate({
                                target: spotifyGenres.name,
                                set: {
                                    name: value,
                                    updatedAt: new Date(),
                                },
                            }),
                    ),
                );

                await Promise.all(
                    spotifyGenresFromDatabase.flat().flatMap((value) =>
                        db
                            .insert(attendeeToSpotifyGenres)
                            .values({
                                attendeeId,
                                sessionId,
                                genreId: value.id,
                            })
                            .onConflictDoNothing(),
                    ),
                );

                return true;
            } catch (error) {
                console.error(error);

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not load top artists from Spotify.",
                });
            }
        }),
});
