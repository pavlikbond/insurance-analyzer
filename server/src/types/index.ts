import type { FastifyRequest } from "fastify";

// User type from Better-Auth
export interface User {
  id: string;
  email: string;
  name?: string;
}

// Extend FastifyRequest to include user info from Better-Auth
export interface AuthenticatedRequest extends FastifyRequest {
  user: User;
}

// Module augmentation to add user to FastifyRequest
declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}

// API Error response
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Common error codes
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  PROCESSING_ERROR = "PROCESSING_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

