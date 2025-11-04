import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index";
import { appConfig } from "../config/index";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: appConfig.betterAuth.secret,
  baseURL: appConfig.betterAuth.url,
  emailAndPassword: {
    enabled: true,
  },
});
