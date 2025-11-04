import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ErrorCode } from "../types/index.js";
import { sendErrorResponse } from "../utils/errors.js";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  // Handle validation errors
  if (error.validation) {
    return sendErrorResponse(
      reply,
      400,
      ErrorCode.VALIDATION_ERROR,
      "Validation failed",
      error.validation
    );
  }

  // Handle specific error codes
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code || ErrorCode.INTERNAL_ERROR,
        message: error.message,
      },
    });
  }

  // Default error response
  return sendErrorResponse(
    reply,
    500,
    ErrorCode.INTERNAL_ERROR,
    "Internal server error"
  );
}

