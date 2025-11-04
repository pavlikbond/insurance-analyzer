import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { appConfig } from "./config/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerRoutes } from "./routes/index.js";

const server = Fastify({
  logger: {
    level: appConfig.nodeEnv === "production" ? "info" : "debug",
    transport:
      appConfig.nodeEnv === "development"
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
});

// Register plugins
async function buildServer() {
  // Cookies (for Better-Auth sessions)
  await server.register(cookie, {
    secret: appConfig.betterAuth.secret,
  });

  // CORS
  await server.register(cors, {
    origin: true,
    credentials: true,
  });

  // Multipart (for file uploads)
  await server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Health check route
  server.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // API routes
  server.get("/api/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register all routes
  await registerRoutes(server);

  // Error handler (must be registered last)
  server.setErrorHandler(errorHandler);

  return server;
}

// Start server
async function start() {
  try {
    const server = await buildServer();
    await server.listen({
      port: appConfig.port,
      host: "0.0.0.0",
    });
    console.log(`Server listening on http://localhost:${appConfig.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

