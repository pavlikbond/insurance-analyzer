import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.js";
import { policiesRoutes } from "./policies";
import { userRoutes } from "./user";
import { analysesRoutes } from "./analyses";

export async function registerRoutes(fastify: FastifyInstance) {
  // Register Better Auth routes (must be registered early to handle /api/auth/*)
  await fastify.register(authRoutes);

  // Register policy routes
  await fastify.register(policiesRoutes);

  // Register user routes
  await fastify.register(userRoutes);

  // Register analysis routes
  await fastify.register(analysesRoutes);

  // TODO: Register other route modules here
  // await fastify.register(reportsRoutes, { prefix: "/api/reports" });
  // await fastify.register(humanReviewsRoutes, { prefix: "/api/human-reviews" });
  // await fastify.register(subscriptionsRoutes, { prefix: "/api/subscriptions" });
}
