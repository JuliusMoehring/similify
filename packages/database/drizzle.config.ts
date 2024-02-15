import { type Config } from "drizzle-kit";

import { env } from "./src/env"

export default {
  schema: "./src/schema/*",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: env.POSTGRES_URL,
  },
} satisfies Config;
