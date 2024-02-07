import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env.js";
import * as session from "./schema/session";
import * as spotify from "./schema/spotify";

export const db = drizzle(postgres(env.DATABASE_URL), {
    schema: {
        ...session,
        ...spotify,
    },
});
