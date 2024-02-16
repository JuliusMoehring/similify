import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(["development", "test", "production"])
            .default("development"),
        API_KEY: z.string().min(16, {
            message: "API_KEY must be at least 16 characters long",
        }),
    },
    client: {},
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        API_KEY: process.env.API_KEY,
    },
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    emptyStringAsUndefined: true,
});
