import type { FastifyRequest, FastifyReply } from "fastify";
import { ErrorCode } from "../types/index";
import { sendErrorResponse } from "../utils/errors";
import { auth } from "../utils/auth";

// Get user from Better-Auth session
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    request.log.debug("Authenticating request");

    // Create headers object
    const headers: Record<string, string> = {};
    Object.keys(request.headers).forEach((key) => {
      const value = request.headers[key];
      if (value) {
        headers[key] = Array.isArray(value) ? value.join(", ") : value;
      }
    });

    request.log.debug("Getting session from Better Auth");

    // Get session from Better Auth - only pass headers, not body (for multipart requests)
    const session = await auth.api.getSession({ headers });

    if (!session || !session.user) {
      request.log.warn("No session or user found");
      return sendErrorResponse(reply, 401, ErrorCode.UNAUTHORIZED, "Authentication required");
    }

    request.log.debug(`User authenticated: ${session.user.email}`);

    // Attach user to request (now properly typed via module augmentation)
    request.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || undefined,
    };
  } catch (error) {
    request.log.error(error, "Error authenticating user");
    return sendErrorResponse(reply, 401, ErrorCode.UNAUTHORIZED, "Authentication required");
  }
}

// Middleware to require authentication
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply);

  // If user is not set, authenticate already sent the error response
  if (!request.user) {
    return;
  }
}
