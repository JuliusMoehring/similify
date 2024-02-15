import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";


import * as custom from "./schema/custom";
import * as session from "./schema/session";
import * as spotify from "./schema/spotify";
import { env } from "./env"

export const sql = neon(env.POSTGRES_URL);

export const db = drizzle(sql, {
  schema: {
    ...session,
    ...spotify,
    ...custom,
  },
});

export * from "./schema/session";
export * from "./schema/spotify";
export * from "./schema/custom";

export * from "drizzle-orm";
