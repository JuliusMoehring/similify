import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const VercelURLSchema = z.preprocess(
    (str) => process.env.VERCEL_URL ?? str,
    process.env.VERCEL ? z.string() : z.string().url(),
);

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),

        VERCEL_URL: VercelURLSchema,

        POSTGRES_URL: z.string().url(),

        CLERK_SECRET_KEY: z.string(),

        SPOTIFY_CLIENT_SECRET: z.string(),
    },
    client: {
        NEXT_PUBLIC_SPOTIFY_CLIENT_ID: z.string(),
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        POSTGRES_URL: process.env.POSTGRES_URL,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

        NEXT_PUBLIC_SPOTIFY_CLIENT_ID:
            process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
