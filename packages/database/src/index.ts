import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "./env";
import * as custom from "./schema/custom";
import * as session from "./schema/session";
import * as similarity from "./schema/similarity";
import * as spotify from "./schema/spotify";

export const sql = neon(env.POSTGRES_URL);

export const db = drizzle(sql, {
    schema: {
        ...session,
        ...spotify,
        ...custom,
        ...similarity,
    },
});

export type DatabaseType = typeof db

export * from "./schema/custom";
export * from "./schema/session";
export * from "./schema/spotify";

export * from "drizzle-orm";
