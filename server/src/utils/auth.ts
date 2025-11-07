import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index";
import { appConfig } from "../config/index";

// Get frontend origin from environment or default to Vite's default port
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: appConfig.betterAuth.secret,
  baseURL: appConfig.betterAuth.url,
  // Trust the frontend origin - required for CORS/CSRF protection
  // This allows requests from the frontend to be accepted
  trustedOrigins: [frontendOrigin],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Trust email from Google OAuth (Google verifies emails)
      // This allows automatic account linking when email matches
      trustEmail: true,
    },
  },
  // Enable account linking - allows linking multiple auth methods to same user
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});
