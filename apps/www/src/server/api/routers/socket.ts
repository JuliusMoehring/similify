import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const socketRouter = createTRPCRouter({
    getAPIToken: protectedProcedure.mutation(async () => {
        return env.API_KEY;
    }),
});
