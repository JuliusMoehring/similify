import { createTRPCRouter } from "~/server/api/trpc";
import { sessionRouter } from "./routers/session";
import { spotifyRouter } from "./routers/spotify";

export const appRouter = createTRPCRouter({
    session: sessionRouter,
    spotify: spotifyRouter,
});

export type AppRouter = typeof appRouter;
