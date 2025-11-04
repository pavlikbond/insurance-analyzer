# Technical Stack Specification

## Frontend Stack

### Core Framework
- **React**: 18.x (latest stable)
- **TypeScript**: 5.x
- **Build Tool**: Vite (recommended) or Next.js
- **Package Manager**: npm or pnpm

### UI & Styling
- **Tailwind CSS**: 3.x
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible component primitives (via shadcn)
- **Lucide React**: Icons

### State Management
- **React Hooks**: useState, useEffect, useContext
- **Optional**: Zustand or Jotai for complex state (if needed)

### Authentication
- **Better-Auth**: Modern authentication library
  - Supports email/password, OAuth providers
  - Session management
  - Built-in security features

### HTTP Client & Data Fetching
- **TanStack Query** (React Query): **REQUIRED** - Primary library for data fetching, caching, and synchronization
- **fetch API** or **axios**: For API calls (used with TanStack Query)

### Forms
- **React Hook Form**: Form handling
- **Zod**: Schema validation (works well with shadcn/ui)

### File Upload
- **Native File API**: For file selection
- **Custom upload component**: With progress tracking

### Payment Integration
- **Stripe**: 
  - Stripe.js for frontend
  - Stripe Checkout or Elements for payment forms

## Backend Stack

### Core Framework
- **Fastify**: 4.x (high-performance web framework)
- **TypeScript**: 5.x
- **Node.js**: 20.x LTS

### Database & ORM
- **PostgreSQL**: Via Neon (managed)
- **Drizzle ORM**: Type-safe ORM
- **Drizzle Kit**: For migrations and schema management

### File Storage
- **AWS SDK v3**: For S3 integration
- **@aws-sdk/client-s3**: S3 client
- **@aws-sdk/s3-request-presigner**: For presigned URLs

### PDF Processing
- **pdf-parse**: Primary PDF text extraction library
- **Alternative**: pdf-lib for PDF manipulation if needed

### AI Integration
- **Vercel AI SDK** (`ai` package): For streaming responses
- **OpenAI Node.js SDK**: For OpenAI API calls
- **Model**: GPT-4 or GPT-4 Turbo (depending on cost/performance needs)

### Authentication
- **Better-Auth**: Server-side authentication
- **JWT**: For API token authentication (if needed)

### Email
- **Resend**: Email service provider
- **React Email**: For email templates (optional)

### Payment Processing
- **Stripe Node.js SDK**: Server-side Stripe integration

### Validation
- **Zod**: Schema validation for API requests/responses

### Utilities
- **dotenv**: Environment variable management
- **cors**: CORS middleware
- **helmet**: Security headers
- **rate-limiter-flexible**: Rate limiting

## Development Tools

### Linting & Formatting
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

### Testing (Future)
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

### Monitoring & Logging
- **Winston** or **Pino**: Logging (Fastify has built-in Pino)
- **Sentry**: Error tracking (optional)

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=insurance-analyzer-pdfs

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3001

# Server
PORT=3001
NODE_ENV=development

# Configuration
HUMAN_REVIEW_PRICE_CENTS=15000  # $150.00 in cents (configurable)
```

## Package Structure

```
insurance-analyzer/
├── client/                    # Frontend (if separate)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   ├── utils/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/                    # Shared types (optional)
│   └── types/
├── docs/                      # Documentation
└── package.json               # Root package.json (workspace setup)
```

## Key Dependencies

### Frontend package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0", // REQUIRED - Data fetching and caching
    "better-auth": "^latest",
    "@stripe/stripe-js": "^2.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^latest"
  }
}
```

### Backend package.json
```json
{
  "dependencies": {
    "fastify": "^4.24.0",
    "@fastify/cors": "^8.4.0",
    "@fastify/multipart": "^8.0.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "@aws-sdk/client-s3": "^3.450.0",
    "@aws-sdk/s3-request-presigner": "^3.450.0",
    "pdf-parse": "^1.1.1",
    "config": "^3.3.0", // For configurable settings like human review price
    "ai": "^2.2.0",
    "openai": "^4.20.0",
    "better-auth": "^latest",
    "resend": "^2.0.0",
    "stripe": "^14.0.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0"
  }
}
```

