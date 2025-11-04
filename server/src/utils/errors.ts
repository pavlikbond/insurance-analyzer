import type { FastifyReply } from "fastify";
import { ErrorCode, type ApiError } from "../types/index.js";

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: unknown
): ApiError {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

export function sendErrorResponse(
  reply: FastifyReply,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: unknown
) {
  return reply.status(statusCode).send(createErrorResponse(code, message, details));
}

