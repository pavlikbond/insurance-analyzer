import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../utils/auth";

/**
 * Better Auth route handler for Fastify
 * Based on official Better Auth Fastify integration guide
 * https://www.better-auth.com/docs/integrations/fastify
 */
export async function authRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request: FastifyRequest, reply: FastifyReply) {
      try {
        // Construct request URL
        const protocol = request.protocol || (request.headers["x-forwarded-proto"] as string) || "http";
        const url = new URL(request.url, `${protocol}://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) {
            headers.append(key, value.toString());
          }
        });

        // Handle body - support both JSON and form-urlencoded for OAuth callbacks
        let body: string | URLSearchParams | undefined;
        if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
          const contentType = request.headers["content-type"] || "";
          if (contentType.includes("application/x-www-form-urlencoded")) {
            // OAuth callbacks use form-urlencoded
            if (typeof request.body === "object") {
              body = new URLSearchParams(request.body as Record<string, string>);
            } else {
              body = request.body as string;
            }
          } else {
            // Default to JSON
            body = JSON.stringify(request.body);
          }
        }

        // Create Fetch API-compatible request
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body,
        });

        // Process authentication request
        const response = await auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error(error, "Authentication Error");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });
}
