import type { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.js";
import { policiesRoutes } from "./policies.js";

export async function registerRoutes(fastify: FastifyInstance) {
  // Register Better Auth routes (must be registered early to handle /api/auth/*)
  await fastify.register(authRoutes);

  // Register policy routes
  await fastify.register(policiesRoutes);

  // TODO: Register other route modules here
  // await fastify.register(analysesRoutes, { prefix: "/api/analyses" });
  // await fastify.register(reportsRoutes, { prefix: "/api/reports" });
  // await fastify.register(humanReviewsRoutes, { prefix: "/api/human-reviews" });
  // await fastify.register(subscriptionsRoutes, { prefix: "/api/subscriptions" });
  // await fastify.register(userRoutes, { prefix: "/api/user" });
}
