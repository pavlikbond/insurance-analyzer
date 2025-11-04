import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString = process.env.DATABASE_URL;

// Create the connection
const client = postgres(connectionString, {
  max: 10,
});

// Create the drizzle instance with both schemas
export const db = drizzle(client, { schema: { ...schema, ...authSchema } });

// Export schemas for use in other files
export * from "./schema";
export * from "./auth-schema";
