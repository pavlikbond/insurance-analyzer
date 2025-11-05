import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userProfiles } from "../db/schema.js";
import { requireAuth } from "../middleware/auth.js";
import { sendErrorResponse } from "../utils/errors.js";
import { ErrorCode } from "../types/index.js";

/**
 * GET /api/user/me
 * Get current authenticated user's information
 */
async function getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Require authentication
    await requireAuth(request, reply);
    const user = request.user;
    if (!user) {
      request.log.warn("Authentication failed or user not found");
      return;
    }

    // Get user profile from database to include subscription info
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id))
      .limit(1);

    // Return user data matching the User type
    return reply.status(200).send({
      id: user.id,
      email: user.email,
      name: user.name || "",
      subscriptionStatus: profile?.subscriptionStatus || undefined,
      subscriptionPlan: profile?.subscriptionPlan || undefined,
      createdAt: profile?.createdAt.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    request.log.error(error, "Error fetching user");
    return sendErrorResponse(reply, 500, ErrorCode.INTERNAL_ERROR, "Failed to fetch user");
  }
}

/**
 * Register user routes
 */
export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/api/user/me", getCurrentUser);
}

