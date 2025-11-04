# API Specification

## Base URL

- Development: `http://localhost:3001/api`
- Production: `https://insurance-analyzer.com/api`

## Authentication

All protected endpoints require authentication via Better-Auth session cookie or Bearer token.

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/signup

Register a new user.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": { ... }
}
```

#### POST /auth/signin

Sign in user.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "user": { ... },
  "session": { ... }
}
```

#### POST /auth/signout

Sign out user.

**Response:**

```json
{
  "success": true
}
```

### Contracts

#### GET /contracts

Get all contracts for the authenticated user.

**Query Parameters:**

- `year`: Filter by contract year (optional)
- `status`: Filter by status (optional)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "contracts": [
    {
      "id": "uuid",
      "fileName": "contract-2024.pdf",
      "originalFileName": "My Insurance 2024.pdf",
      "coverageStart": "2024-01-01",
      "coverageEnd": "2025-01-01",
      "description": "Home insurance policy for primary residence",
      "status": "analyzed",
      "fileSize": 1024000,
      "uploadedAt": "2024-01-15T10:00:00Z",
      "processedAt": "2024-01-15T10:05:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

#### GET /contracts/:id

Get a specific contract by ID.

**Response:**

```json
{
  "id": "uuid",
  "fileName": "contract-2024.pdf",
  "originalFileName": "My Insurance 2024.pdf",
      "contractYear": 2024,
      "description": "Home insurance policy for primary residence",
      "status": "analyzed",
  "fileSize": 1024000,
  "s3Url": "https://presigned-url...",
  "uploadedAt": "2024-01-15T10:00:00Z",
  "processedAt": "2024-01-15T10:05:00Z",
  "analysis": { ... }
}
```

#### POST /contracts/upload

Upload a new insurance contract PDF. Contract is uploaded but NOT analyzed automatically.

**Request:** Multipart form data

- `file`: PDF file (max 10MB)
- `coverageStart`: Coverage start date (REQUIRED, ISO 8601: YYYY-MM-DD, e.g., 2024-01-01)
- `coverageEnd`: Coverage end date (OPTIONAL, ISO 8601: YYYY-MM-DD, e.g., 2025-01-01, defaults to 1 year from coverageStart)
- `description`: Optional description or notes about the contract

**Response:**

```json
{
  "contract": {
    "id": "uuid",
    "fileName": "contract-2024.pdf",
    "contractYear": 2024,
    "status": "uploaded",
    "uploadedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Contract uploaded successfully. Select contracts and click 'Get Report' to analyze."
}
```

**Status Codes:**

- 201: Created
- 400: Bad request (invalid file, missing data)
- 413: File too large
- 500: Server error

#### DELETE /contracts/:id

Delete a contract and its associated data.

**Response:**

```json
{
  "success": true,
  "message": "Contract deleted successfully"
}
```

### Analyses

#### GET /contracts/:contractId/analysis

Get analysis for a specific contract.

**Response:**

```json
{
  "id": "uuid",
  "contractId": "uuid",
  "summary": "This health insurance contract provides comprehensive coverage...",
  "keyTerms": {
    "deductible": { "amount": 1000, "currency": "USD" },
    "coverageLimit": { "amount": 1000000, "currency": "USD" },
    "coverageTypes": ["health", "dental", "vision"],
    "premium": { "monthly": 500, "currency": "USD" }
  },
  "coverageDetails": { ... },
  "exclusions": ["Pre-existing conditions", "Cosmetic procedures"],
  "premiums": { ... },
  "aiModel": "gpt-4-turbo",
  "createdAt": "2024-01-15T10:05:00Z"
}
```

#### POST /analyses/batch

Analyze multiple contracts in batch. User selects contracts and triggers analysis.

**Request:**

```json
{
  "contractIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**

```json
{
  "analyses": [
    {
      "contractId": "uuid1",
      "analysisId": "uuid",
      "status": "processing"
    },
    {
      "contractId": "uuid2",
      "analysisId": "uuid",
      "status": "processing"
    }
  ],
  "message": "Analysis started for selected contracts. You will be notified when complete."
}
```

**Status Codes:**

- 202: Accepted (processing started)
- 400: Bad request (invalid contract IDs, contracts already analyzed, etc.)
- 403: Forbidden (user doesn't own all contracts)

#### POST /contracts/:contractId/analyze

Trigger a new analysis for a single contract (if one doesn't exist or to re-analyze).

**Response:**

```json
{
  "analysisId": "uuid",
  "status": "processing",
  "message": "Analysis started. You will be notified when complete."
}
```

### Comparisons

#### GET /comparisons

Get all comparisons for the authenticated user.

**Query Parameters:**

- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "comparisons": [
    {
      "id": "uuid",
      "previousContract": {
        "id": "uuid",
        "contractYear": 2023,
        "fileName": "contract-2023.pdf"
      },
      "newContract": {
        "id": "uuid",
        "coverageStart": "2024-01-01",
      "coverageEnd": "2025-01-01",
        "fileName": "contract-2024.pdf"
      },
      "summary": "Key changes detected...",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ],
  "total": 2
}
```

#### GET /comparisons/:id

Get a specific comparison by ID.

**Response:**

```json
{
  "id": "uuid",
  "previousContract": { ... },
  "newContract": { ... },
  "summary": "Comparison summary...",
  "changesDetected": {
    "premiumChanges": { "old": 500, "new": 550, "change": 10 },
    "deductibleChanges": { "old": 1000, "new": 1200, "change": 20 },
    "coverageChanges": ["Added vision coverage", "Removed dental coverage"],
    "termChanges": ["Updated cancellation policy"]
  },
  "comparisonResult": "Full AI comparison text...",
  "createdAt": "2024-01-15T11:00:00Z"
}
```

#### POST /comparisons

Create a new comparison between two contracts. Can auto-detect previous year's contract.

**Request:**

```json
{
  "newContractId": "uuid", // Required: the new/current year contract
  "previousContractId": "uuid" // Optional: if not provided, auto-detect previous year's contract
}
```

**Auto-detection Logic:**

- If `previousContractId` is not provided, system will:
  1. Get the `coverageStart` date of `newContractId`
  2. Find the user's contract with `coverageStart` date that is approximately 1 year before the new contract's start date
  3. Use that as the previous contract
  4. If multiple contracts exist for similar periods, use the most recently uploaded one

**Response:**

```json
{
  "comparisonId": "uuid",
  "previousContractId": "uuid", // May be auto-detected
  "newContractId": "uuid",
  "status": "processing",
  "message": "Comparison started. You will be notified when complete."
}
```

**Status Codes:**

- 201: Created
- 400: Bad request (contracts not found, same contract, previous year contract not found for auto-detection, etc.)
- 409: Comparison already exists

### Human Reviews

#### GET /human-reviews

Get all human review requests for the authenticated user.

**Response:**

```json
{
  "reviews": [
    {
      "id": "uuid",
      "contractId": "uuid",
      "analysisId": "uuid",
      "status": "pending",
      "requestedAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### POST /human-reviews

Request a human review (upsell feature).

**Request:**

```json
{
  "contractId": "uuid",
  "analysisId": "uuid" // Optional, if reviewing analysis
  // OR
  "comparisonId": "uuid" // Optional, if reviewing comparison
}
```

**Response:**

```json
{
  "reviewId": "uuid",
  "paymentIntent": {
    "clientSecret": "pi_...",
    "amount": 15000 // $150.00 in cents (configurable)
  },
  "message": "Please complete payment to proceed with human review"
}
```

#### GET /human-reviews/:id

Get a specific human review.

**Response:**

```json
{
  "id": "uuid",
  "contractId": "uuid",
  "analysisId": "uuid",
  "status": "completed",
  "reviewerNotes": "Detailed human review notes...",
  "requestedAt": "2024-01-15T12:00:00Z",
  "completedAt": "2024-01-16T10:00:00Z"
}
```

### Subscriptions

#### GET /subscriptions/current

Get current user's subscription.

**Response:**

```json
{
  "id": "uuid",
  "status": "active",
  "plan": "ai_analyzer", // or "ai_analyzer_plus"
  "currentPeriodStart": "2024-01-01T00:00:00Z",
  "currentPeriodEnd": "2024-02-01T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

#### POST /subscriptions/create-checkout

Create Stripe checkout session for subscription.

**Request:**

```json
{
  "plan": "ai_analyzer" // or "ai_analyzer_plus" (includes human review access)
}
```

**Response:**

```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

#### POST /subscriptions/cancel

Cancel current subscription.

**Response:**

```json
{
  "success": true,
  "message": "Subscription will cancel at end of period"
}
```

#### POST /subscriptions/webhook

Stripe webhook endpoint for subscription events.

**Note:** This endpoint should verify Stripe signature.

### User

#### GET /user/me

Get current authenticated user.

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "subscriptionStatus": "active",
  "subscriptionPlan": "ai_analyzer", // or "ai_analyzer_plus"
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### PATCH /user/me

Update user profile.

**Request:**

```json
{
  "name": "John Doe Updated"
}
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe Updated",
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // Optional additional details
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: File type not supported
- `PROCESSING_ERROR`: Error during PDF processing or AI analysis
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Upload endpoints: 10 requests per hour
- Analysis endpoints: 20 requests per hour
- All other endpoints: 100 requests per minute

## Webhooks

### Stripe Webhooks

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`
- `payment_intent.failed`

### Resend Webhooks (Optional)

- Email delivery status
- Email bounce notifications
