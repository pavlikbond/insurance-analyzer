# Database Schema Specification

## Overview

The database schema uses Drizzle ORM with PostgreSQL. All tables include standard timestamps (`createdAt`, `updatedAt`) managed by Drizzle.

## Tables

### users
Stores user account information. Better-Auth may handle its own user table, so this may be integrated or separate.

```typescript
{
  id: string (UUID, primary key)
  email: string (unique, indexed)
  name: string (nullable)
  createdAt: timestamp
  updatedAt: timestamp
  stripeCustomerId: string (nullable, indexed) // For Stripe integration
  subscriptionStatus: enum ('active', 'canceled', 'past_due')
  subscriptionPlan: enum ('ai_analyzer', 'ai_analyzer_plus') // Two tiers: basic AI, and AI + human review access
}
```

### contracts
Stores metadata about uploaded insurance contracts.

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key -> users.id, indexed)
  fileName: string
  originalFileName: string
  s3Key: string // S3 object key
  s3Bucket: string
  fileSize: number // bytes
  mimeType: string // 'application/pdf'
  coverageStart: string // Coverage start date (ISO 8601: YYYY-MM-DD) - REQUIRED field, used to determine previous contract for auto-detection
  coverageEnd: string (nullable) // Coverage end date (ISO 8601: YYYY-MM-DD) - Optional, defaults to 1 year from coverageStart
  description: string (nullable) // Optional description or notes about the contract
  status: enum ('uploaded', 'processing', 'analyzed', 'failed', indexed) // 'uploaded' means ready for analysis, not yet analyzed
  uploadedAt: timestamp
  processedAt: timestamp (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### analyses
Stores AI-generated analysis results for each contract.

```typescript
{
  id: string (UUID, primary key)
  contractId: string (foreign key -> contracts.id, unique, indexed)
  summary: text // High-level summary
  keyTerms: jsonb // Structured key terms (deductibles, coverage limits, etc.)
  coverageDetails: jsonb // Detailed coverage information
  exclusions: jsonb // List of exclusions
  premiums: jsonb // Premium information
  aiModel: string // e.g., 'gpt-4-turbo'
  aiTokensUsed: number // For cost tracking
  analysisPrompt: text // The prompt used for analysis
  analysisResult: text // Full AI response
  createdAt: timestamp
  updatedAt: timestamp
}
```

### comparisons
Stores year-over-year comparison results between contracts.

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key -> users.id, indexed)
  previousContractId: string (foreign key -> contracts.id)
  newContractId: string (foreign key -> contracts.id)
  changesDetected: jsonb // Structured changes
  summary: text // High-level summary of changes
  aiModel: string
  aiTokensUsed: number
  comparisonResult: text // Full AI comparison response
  createdAt: timestamp
  updatedAt: timestamp
}
```

### human_reviews
Stores information about human review requests (upsell feature).

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key -> users.id, indexed)
  contractId: string (foreign key -> contracts.id, indexed)
  analysisId: string (foreign key -> analyses.id, nullable)
  comparisonId: string (foreign key -> comparisons.id, nullable)
  status: enum ('pending', 'in_progress', 'completed', 'cancelled', indexed)
  requestedAt: timestamp
  completedAt: timestamp (nullable)
  reviewerNotes: text (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### subscriptions
Stores Stripe subscription information.

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key -> users.id, unique, indexed)
  stripeSubscriptionId: string (unique, indexed)
  stripeCustomerId: string (indexed)
  status: enum ('active', 'canceled', 'past_due', 'trialing')
  plan: enum ('ai_analyzer', 'ai_analyzer_plus')
  currentPeriodStart: timestamp
  currentPeriodEnd: timestamp
  cancelAtPeriodEnd: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### payments
Tracks payment history and human review purchases.

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key -> users.id, indexed)
  stripePaymentIntentId: string (unique, indexed)
  amount: number // in cents (human review: 15000 = $150.00, configurable)
  currency: string // 'usd'
  status: enum ('pending', 'succeeded', 'failed', 'refunded')
  type: enum ('subscription', 'human_review', 'one_time')
  humanReviewId: string (foreign key -> human_reviews.id, nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### email_notifications
Tracks email notifications sent to users.

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key -> users.id, indexed)
  type: enum ('analysis_ready', 'comparison_ready', 'human_review_ready', 'billing')
  contractId: string (foreign key -> contracts.id, nullable)
  analysisId: string (foreign key -> analyses.id, nullable)
  comparisonId: string (foreign key -> comparisons.id, nullable)
  resendEmailId: string (nullable) // Resend email ID for tracking
  status: enum ('pending', 'sent', 'failed')
  sentAt: timestamp (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Indexes

### Performance Indexes
- `users.email`: Unique index
- `users.stripeCustomerId`: Index for Stripe lookups
- `contracts.userId`: Index for user's contract queries
- `contracts.status`: Index for processing queue queries
- `contracts.coverageStart`: Index for date-based queries
- `analyses.contractId`: Unique index (one analysis per contract)
- `comparisons.userId`: Index for user's comparison queries
- `human_reviews.status`: Index for pending reviews
- `subscriptions.userId`: Unique index
- `subscriptions.stripeSubscriptionId`: Unique index

### Composite Indexes
- `contracts(userId, coverageStart)`: For finding user's contracts by coverage period
- `comparisons(userId, createdAt)`: For user's comparison history

## Relationships

```
users (1) ────< (many) contracts
users (1) ────< (many) comparisons
users (1) ────< (many) human_reviews
users (1) ────< (1) subscriptions
users (1) ────< (many) payments
users (1) ────< (many) email_notifications

contracts (1) ────< (1) analyses
contracts (1) ────< (many) comparisons (as previousContractId)
contracts (1) ────< (many) comparisons (as newContractId)
contracts (1) ────< (many) human_reviews

analyses (1) ────< (many) human_reviews
comparisons (1) ────< (many) human_reviews
```

## Data Types & Constraints

### JSONB Fields
- `analyses.keyTerms`: Structured format
  ```json
  {
    "deductible": { "amount": 1000, "currency": "USD" },
    "coverageLimit": { "amount": 1000000, "currency": "USD" },
    "coverageTypes": ["health", "dental", "vision"],
    "premium": { "monthly": 500, "currency": "USD" }
  }
  ```

- `analyses.coverageDetails`: Detailed coverage breakdown
- `analyses.exclusions`: Array of exclusion strings
- `analyses.premiums`: Premium structure
- `comparisons.changesDetected`: 
  ```json
  {
    "premiumChanges": { "old": 500, "new": 550, "change": 10 },
    "deductibleChanges": { "old": 1000, "new": 1200, "change": 20 },
    "coverageChanges": ["Added vision coverage", "Removed dental coverage"],
    "termChanges": ["Updated cancellation policy", "New exclusions added"]
  }
  ```

## Migration Strategy

- Use Drizzle Kit for migrations
- Migrations stored in `server/db/migrations/`
- Version control all migrations
- Test migrations on staging before production

## Backup & Recovery

- Neon provides automatic backups
- Consider point-in-time recovery for critical data
- Regular export of JSONB data for redundancy

