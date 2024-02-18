import { createTRPCRouter } from "~/server/api/trpc";
import { customRouter } from "./routers/custom";
import { sessionRouter } from "./routers/session";
import { socketRouter } from "./routers/socket";
import { spotifyRouter } from "./routers/spotify";
import { similarityRouter } from "./routers/similarity";

export const appRouter = createTRPCRouter({
    custom: customRouter,
    session: sessionRouter,
    similarity: similarityRouter,
    spotify: spotifyRouter,
    socket: socketRouter,
});

export type AppRouter = typeof appRouter;
