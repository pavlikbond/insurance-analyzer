import * as z from "zod";

/**
 * Shared password validation schema
 * Enforces minimum 8 characters for consistency across signup and password reset.
 * This matches the backend validation enforced by Better Auth.
 */
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

/**
 * Schema for signup form - password only (no confirmation)
 * Uses the same password validation as reset password for consistency.
 */
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

/**
 * Schema for forms that require password confirmation
 * (e.g., reset password)
 */
export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
