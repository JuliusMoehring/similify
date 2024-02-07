import { type Config } from "drizzle-kit";

import { env } from "~/env.js";

export default {
    schema: "./src/server/db/schema/*",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: env.DATABASE_URL,
    },
} satisfies Config;
