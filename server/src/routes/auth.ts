import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../utils/auth";

/**
 * Better Auth route handler for Fastify
 * Handles all authentication requests at /api/auth/*
 */
export async function authRoutes(fastify: FastifyInstance) {
  // Handle all methods (GET, POST) for /api/auth/* routes
  fastify.all("/api/auth/*", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Construct the full URL
      const protocol = request.protocol || (request.headers["x-forwarded-proto"] as string) || "http";
      const host = request.headers.host || "localhost";
      const url = new URL(request.url, `${protocol}://${host}`);

      // Preserve query string if present
      if (request.url.includes("?")) {
        const [pathname, search] = request.url.split("?");
        url.pathname = pathname;
        url.search = search;
      }

      // Get request body if it exists
      let body: string | undefined;
      if (request.method !== "GET" && request.method !== "HEAD") {
        const contentType = request.headers["content-type"] || "";

        if (request.isMultipart()) {
          // For multipart/form-data, Better Auth will handle it
          body = undefined;
        } else if (contentType.includes("application/json")) {
          // For JSON, stringify it
          body = request.body
            ? typeof request.body === "string"
              ? request.body
              : JSON.stringify(request.body)
            : undefined;
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          // For form data, convert to URL-encoded string
          if (request.body && typeof request.body === "object") {
            const formData = new URLSearchParams();
            Object.entries(request.body as Record<string, string>).forEach(([key, value]) => {
              formData.append(key, value);
            });
            body = formData.toString();
          } else if (typeof request.body === "string") {
            body = request.body;
          }
        } else {
          // Default: try to handle as string
          body =
            typeof request.body === "string" ? request.body : request.body ? JSON.stringify(request.body) : undefined;
        }
      }

      // Create headers object
      const headers: Record<string, string> = {};
      Object.keys(request.headers).forEach((key) => {
        const value = request.headers[key];
        if (value) {
          headers[key] = Array.isArray(value) ? value.join(", ") : value;
        }
      });

      // Create a standard Request object
      const webRequest = new Request(url.toString(), {
        method: request.method,
        headers: headers,
        body: body,
      });

      // Handle the request with Better Auth
      const response = await auth.handler(webRequest);

      // Convert Response to Fastify reply
      reply.status(response.status);

      // Copy headers from response
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      // Get response body
      const responseBody = await response.text();

      // Send response
      if (responseBody) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            const json = JSON.parse(responseBody);
            return reply.send(json);
          } catch {
            return reply.send(responseBody);
          }
        }
        return reply.send(responseBody);
      }

      return reply.send();
    } catch (error) {
      request.log.error(error, "Error handling auth request");
      reply.status(500).send({ error: "Internal server error" });
    }
  });
}
