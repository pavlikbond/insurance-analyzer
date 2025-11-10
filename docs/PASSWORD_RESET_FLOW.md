# Password Reset Flow Specification

## Overview

This document outlines the complete password reset flow implementation using Better-Auth library and Resend for email delivery. The flow allows users to request a password reset via email and securely reset their password using a time-limited token.

## Flow Diagram

```
1. User clicks "Forgot Password" on Sign In page
   ↓
2. User enters email address on Forgot Password page
   ↓
3. Frontend calls Better-Auth requestPasswordReset API
   ↓
4. Better-Auth generates secure token and stores it
   ↓
5. Better-Auth triggers sendResetPassword callback
   ↓
6. Backend sends email via Resend with reset link
   ↓
7. User clicks link in email
   ↓
8. User redirected to Reset Password page with token in URL
   ↓
9. User enters new password
   ↓
10. Frontend calls Better-Auth resetPassword API with token
   ↓
11a. If token invalid/expired: Better-Auth returns error, frontend redirects to forgot password page
   ↓
11b. If token valid: Better-Auth validates token and updates password
   ↓
12. User redirected to Sign In page with success message
```

## Better-Auth Configuration

### Required Configuration

The Better-Auth configuration in `server/src/utils/auth.ts` needs to be updated to include password reset functionality:

```typescript
export const auth = betterAuth({
  // ... existing config ...
  emailAndPassword: {
    enabled: true,
    // Add password reset configuration
    sendResetPassword: async ({ user, url, token }, request) => {
      // This function is called by Better-Auth when a password reset is requested
      // We'll implement this to send email via Resend
      await sendPasswordResetEmail(user.email, user.name || undefined, url);
    },
    resetPasswordTokenExpiresIn: 3600, // Token expires in 1 hour (3600 seconds)
  },
});
```

### Configuration Options

- **`sendResetPassword`**: Async function that receives:

  - `user`: User object with email, name, id
  - `url`: Complete reset URL with token (e.g., `https://yourapp.com/reset-password?token=abc123`)
  - `token`: The reset token itself (if needed for custom handling)
  - `request`: The incoming request object

- **`resetPasswordTokenExpiresIn`**: Token expiration time in seconds
  - **Recommended**: 3600 seconds (1 hour)
  - **Minimum**: 900 seconds (15 minutes) for security
  - **Maximum**: 86400 seconds (24 hours) - not recommended for security

## Routes

### Backend Routes (Better-Auth Handled)

Better-Auth automatically handles these routes via the existing `/api/auth/*` catch-all route:

1. **POST `/api/auth/forget-password`**

   - **Purpose**: Request password reset
   - **Body**: `{ email: string }`
   - **Response**: `{ message: string }` (always returns success to prevent email enumeration)
   - **Behavior**: Generates token, stores it, calls `sendResetPassword` callback

2. **POST `/api/auth/reset-password`**

   - **Purpose**: Reset password with token
   - **Body**: `{ token: string, newPassword: string }`
   - **Response**: `{ message: string }` or error
   - **Behavior**: Validates token, checks expiration, updates password, invalidates token
   - **Error Handling**: Returns specific error codes for invalid/expired tokens that frontend can handle

### Frontend Routes

Add these routes to `src/App.tsx`:

1. **GET `/forgot-password`**

   - **Component**: `src/pages/auth/ForgotPassword.tsx`
   - **Layout**: `AppLayout` (same as SignIn/SignUp)
   - **Purpose**: Form to request password reset
   - **Fields**: Email input
   - **Actions**: Submit email, link back to Sign In
   - **Error Handling**: Display error message from query params if redirected from Reset Password page

2. **GET `/reset-password`**
   - **Component**: `src/pages/auth/ResetPassword.tsx`
   - **Layout**: `AppLayout` (same as SignIn/SignUp)
   - **Purpose**: Form to enter new password
   - **Query Params**: `token` (required)
   - **Fields**: New password, confirm password
   - **Actions**: Submit new password, redirect to forgot password page on token errors

## Frontend Organization

### Authentication Pages Folder Structure

All authentication-related pages should be organized in a dedicated folder for better code organization:

**Current Structure:**

```
src/pages/
  ├── SignIn.tsx
  ├── SignUp.tsx
  └── ...
```

**New Structure:**

```
src/pages/
  ├── auth/
  │   ├── SignIn.tsx
  │   ├── SignUp.tsx
  │   ├── ForgotPassword.tsx
  │   └── ResetPassword.tsx
  ├── Dashboard.tsx
  ├── Policies.tsx
  └── ...
```

### Migration Steps

1. Create `src/pages/auth/` directory
2. Move existing files:
   - `src/pages/SignIn.tsx` → `src/pages/auth/SignIn.tsx`
   - `src/pages/SignUp.tsx` → `src/pages/auth/SignUp.tsx`
3. Create new files in `src/pages/auth/`:
   - `ForgotPassword.tsx`
   - `ResetPassword.tsx`
4. Update imports in `src/App.tsx`:

   ```typescript
   // Old imports
   import { SignIn } from "@/pages/SignIn";
   import { SignUp } from "@/pages/SignUp";

   // New imports
   import { SignIn } from "@/pages/auth/SignIn";
   import { SignUp } from "@/pages/auth/SignUp";
   import { ForgotPassword } from "@/pages/auth/ForgotPassword";
   import { ResetPassword } from "@/pages/auth/ResetPassword";
   ```

5. Update any other files that import these components (if any)

### Benefits

- **Better Organization**: All authentication pages grouped together
- **Easier Navigation**: Clear separation of auth vs. app pages
- **Scalability**: Easy to add more auth-related pages (e.g., EmailVerification, TwoFactorAuth)
- **Consistency**: Follows common React project structure patterns

## Token Specifications

### Token Generation

- **Method**: Cryptographically secure random token generated by Better-Auth
- **Format**: Base64-encoded string (Better-Auth default)
- **Length**: Typically 32+ bytes (256+ bits)
- **Storage**: Stored in database with expiration timestamp

### Token Expiration

- **Default**: 1 hour (3600 seconds)
- **Expiration Check**: Better-Auth automatically validates expiration
- **After Expiration**: Token becomes invalid, user must request new reset link
- **After Use**: Token is automatically invalidated after successful password reset (single-use)

### Token Security

- **Single Use**: Token is invalidated immediately after successful password reset
- **Rate Limiting**: Should be applied to prevent abuse (already configured in Fastify rate limiter)
- **HTTPS Required**: Reset links must be sent over HTTPS in production
- **No Token Reuse**: Expired or used tokens cannot be reused

## Email Template

### Email Function

Create a new function in `server/src/utils/email.ts`:

```typescript
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string | undefined,
  resetUrl: string,
  log: FastifyRequest["log"]
): Promise<void>;
```

### Email Content

- **Subject**: "Reset Your Password - Insurance Analyzer"
- **From**: Same as analysis emails (e.g., "Insurance Analyzer <onboarding@resend.dev>")
- **Template**: HTML email matching the app's design system
- **Content**:
  - Greeting with user's name (or "there" if no name)
  - Clear explanation of why they're receiving the email
  - Prominent "Reset Password" button linking to reset URL
  - Security notice about link expiration (1 hour)
  - Note that if they didn't request this, they can ignore the email
  - Link to support if needed

### Email Design

- Use same color scheme as analysis complete emails
- Match the app's primary color (#ef443b)
- Responsive design for mobile/desktop
- Clear call-to-action button

## Frontend Implementation

### Forgot Password Page (`src/pages/auth/ForgotPassword.tsx`)

**Features**:

- Email input field with validation
- Submit button (disabled while loading)
- Success message after submission (generic, doesn't reveal if email exists)
- **Handle error query parameters**: Display error message if redirected from Reset Password page (e.g., `?error=invalid_token`)
- Link back to Sign In page
- Error handling for network issues

**Form Schema**:

```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
```

**API Call**:

```typescript
const { data, error } = await authClient.forgetPassword({
  email: formData.email,
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### Reset Password Page (`src/pages/auth/ResetPassword.tsx`)

**Features**:

- Extract token from URL query parameter
- Show password reset form immediately (no pre-validation)
- New password input (with show/hide toggle)
- Confirm password input (with validation match)
- Submit button
- Handle token validation errors from API (expired, invalid, missing)
- **On token error**: Redirect to `/forgot-password` with error message
- Success message and redirect to Sign In
- Link back to Sign In page

**Form Schema**:

```typescript
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

**Password Reset API Call** (on form submit):

```typescript
const token = new URLSearchParams(window.location.search).get("token");
if (!token) {
  // Redirect to forgot password page if token is missing
  navigate("/forgot-password?error=missing_token");
  return;
}

const { data, error } = await authClient.resetPassword({
  token,
  newPassword: formData.password,
});

if (error) {
  // Check if error is due to invalid/expired token
  if (error.code === "INVALID_TOKEN" || error.code === "EXPIRED_TOKEN" || error.message?.includes("token")) {
    // Redirect to forgot password page with error message
    navigate("/forgot-password?error=invalid_token");
    return;
  }
  // Handle other errors (e.g., weak password)
  setError(error.message);
  return;
}

// Success - redirect to sign in
navigate("/signin?reset=success");
```

## Security Considerations

### Email Enumeration Prevention

- **Always return success**: The response to password reset requests should always be the same, regardless of whether the email exists
- **Generic message**: "If an account exists with this email, a password reset link has been sent"
- **No timing attacks**: Response time should be consistent

### Rate Limiting

- **Existing Protection**: Fastify rate limiter already configured (100 requests per minute)
- **Additional Consideration**: May want stricter limits on `/api/auth/forget-password` endpoint
- **IP-based**: Rate limiting should be IP-based to prevent abuse

### Token Security

- **HTTPS Only**: Reset links must use HTTPS in production
- **Single Use**: Tokens are automatically invalidated after use
- **Expiration**: 1-hour expiration prevents long-lived attack vectors
- **Secure Storage**: Tokens stored securely in database by Better-Auth

### Password Requirements

- **Minimum Length**: 8 characters (enforced in frontend validation)
- **Complexity**: Should include uppercase, lowercase, numbers (enforced in frontend)
- **No Common Passwords**: Consider adding common password check (optional enhancement)

### Additional Security Measures

- **Logging**: Log password reset requests (without sensitive data) for security monitoring
- **Account Lockout**: Consider implementing account lockout after multiple failed reset attempts (future enhancement)
- **Email Verification**: Ensure email is verified before allowing password reset (Better-Auth handles this)

## Error Handling

### Forgot Password Errors

- **Network Error**: Show generic error message, allow retry
- **Invalid Email**: Show validation error (client-side)
- **Rate Limited**: Show message about too many requests, suggest waiting

### Reset Password Errors

- **Missing Token**: Redirect to forgot password page with error message
- **Invalid Token**: Show error message with link to request new reset
- **Expired Token**: Show error message with link to request new reset
- **Weak Password**: Show validation errors from schema
- **Network Error**: Show generic error, allow retry

## User Experience

### Forgot Password Flow

1. User clicks "Forgot Password?" link on Sign In page
2. User enters email and submits
3. Show success message immediately (don't wait for email)
4. Message: "If an account exists with this email, you'll receive a password reset link shortly."
5. Provide link back to Sign In

### Reset Password Flow

1. User clicks link in email
2. User redirected to Reset Password page (form shown immediately)
3. User enters new password (with strength indicator - optional)
4. User submits form
5. **If token is invalid/expired**: API returns error, user redirected to Forgot Password page with error message
6. **If token is valid**: Password is reset, user redirected to Sign In with success message
7. User can sign in with new password

### Success States

- **Email Sent**: "Check your email for a password reset link"
- **Password Reset**: "Your password has been reset successfully. Please sign in with your new password."

## Implementation Checklist

### Backend

- [ ] Update `server/src/utils/auth.ts` to add `sendResetPassword` callback
- [ ] Add `resetPasswordTokenExpiresIn` configuration (3600 seconds)
- [ ] Create `sendPasswordResetEmail` function in `server/src/utils/email.ts`
- [ ] Test email sending with Resend
- [ ] Verify Better-Auth routes are accessible via `/api/auth/*`

### Frontend

- [ ] **Organize authentication pages**: Move all auth pages into `src/pages/auth/` folder
  - [ ] Move `src/pages/SignIn.tsx` → `src/pages/auth/SignIn.tsx`
  - [ ] Move `src/pages/SignUp.tsx` → `src/pages/auth/SignUp.tsx`
  - [ ] Create `src/pages/auth/ForgotPassword.tsx` component
  - [ ] Create `src/pages/auth/ResetPassword.tsx` component
  - [ ] Update imports in `src/App.tsx` to reflect new paths
- [ ] Add routes to `src/App.tsx` for `/forgot-password` and `/reset-password`
- [ ] Add "Forgot Password?" link to Sign In page
- [ ] Update `src/lib/auth-client.ts` to export `forgetPassword` and `resetPassword` methods
- [ ] Implement error handling in ResetPassword component to redirect on token errors
- [ ] Test complete flow end-to-end

### Testing

- [ ] Test forgot password with valid email
- [ ] Test forgot password with invalid email (should still show success)
- [ ] Test reset password submission with valid token
- [ ] Test reset password submission with expired token (should redirect to forgot password page)
- [ ] Test reset password submission with invalid token (should redirect to forgot password page)
- [ ] Test reset password page with missing token (should redirect to forgot password page)
- [ ] Test password validation (weak passwords)
- [ ] Test email template rendering
- [ ] Test rate limiting on password reset requests
- [ ] Test token single-use (can't reset password twice with same token)

## Better-Auth Client Methods

### Request Password Reset

```typescript
const { data, error } = await authClient.forgetPassword({
  email: "user@example.com",
  redirectTo: "https://yourapp.com/reset-password",
});
```

### Reset Password

```typescript
const { data, error } = await authClient.resetPassword({
  token: "reset-token-from-url",
  newPassword: "newSecurePassword123",
});
```

## Environment Variables

No new environment variables required. Uses existing:

- `FRONTEND_ORIGIN`: For constructing reset URLs
- `RESEND_API_KEY`: For sending emails (already configured)
- `BETTER_AUTH_SECRET`: For token signing (already configured)

## Database Schema

Better-Auth automatically manages the password reset token storage. No manual database changes required. The tokens are stored in the Better-Auth managed tables.

## Notes

- Better-Auth handles all token generation, validation, and expiration automatically
- The `/api/auth/*` route already exists and handles Better-Auth endpoints
- Email sending is the only custom implementation needed
- Token expiration is configurable but 1 hour is recommended
- All security best practices are handled by Better-Auth internally
- **Simplified approach**: Token validation happens when the user submits the form, not on page load. This saves an extra API route while still providing good UX by redirecting users to the forgot password page if their token is invalid/expired.
