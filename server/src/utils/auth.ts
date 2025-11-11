import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { FastifyRequest } from "fastify";
import { db } from "../db/index";
import { appConfig } from "../config/index";
import { sendPasswordResetEmail } from "./email.js";

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
    sendResetPassword: async ({ user, url }) => {
      // This function is called by Better-Auth when a password reset is requested
      // Since Better-Auth doesn't pass FastifyRequest directly, we create a simple logger
      // In production, you might want to use a proper logger service
      // Create a minimal logger compatible with FastifyRequest["log"]
      // Better-Auth doesn't provide request context, so we use console logging
      const log = {
        info: (message: string) => console.log(`[Password Reset] ${message}`),
        error: (error: unknown, message: string) => console.error(`[Password Reset] ${message}`, error),
        warn: (message: string) => console.warn(`[Password Reset] ${message}`),
        debug: (message: string) => console.debug(`[Password Reset] ${message}`),
        fatal: (error: unknown, message: string) => console.error(`[Password Reset FATAL] ${message}`, error),
        trace: (message: string) => console.trace(`[Password Reset] ${message}`),
        child: () => log,
        level: "info",
        silent: false,
      } as unknown as FastifyRequest["log"];

      await sendPasswordResetEmail(user.email, user.name || undefined, url, log);
    },
    resetPasswordTokenExpiresIn: 3600, // Token expires in 1 hour (3600 seconds)
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
