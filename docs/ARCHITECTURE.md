# Insurance Analyzer - Architecture Overview

## System Overview

Insurance Analyzer is a web application that helps users analyze their insurance contracts using AI. Users can upload insurance PDFs, receive AI-powered analysis, and compare contracts year-over-year to identify changes in terms and coverage.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  - Tailwind CSS                                              │
│  - shadcn/ui components                                      │
│  - Better-Auth for authentication                           │
│  - Stripe integration for billing                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Backend (Fastify)                         │
│  - REST API endpoints                                        │
│  - Authentication middleware                                 │
│  - File upload handling                                      │
│  - PDF processing pipeline                                   │
│  - AI analysis orchestration                                 │
│  - Email notifications                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
│  PostgreSQL  │ │     S3     │ │   OpenAI   │
│   (Neon)     │ │  (PDFs)    │ │    API     │
└──────────────┘ └─────────────┘ └────────────┘
        │
        │
┌───────▼──────┐ ┌─────────────┐
│   Stripe     │ │   Resend    │
│   (Billing)  │ │   (Email)   │
└──────────────┘ └─────────────┘
```

## Core Components

### 1. Frontend Application

- **Location**: Root directory (or `client/` folder)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query (React Query) - REQUIRED for all API calls
- **State Management**: React hooks, Context API (or Zustand if needed)
- **Authentication**: Better-Auth client
- **File Upload**: Direct to backend or presigned S3 URLs

### 2. Backend Server

- **Location**: `server/` folder
- **Framework**: Fastify
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Package Management**: Separate `package.json` in `server/`

### 3. Database

- **Provider**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle migrations

### 4. File Storage

- **Provider**: AWS S3
- **Purpose**: Store uploaded PDF contracts
- **Access**: Private buckets with presigned URLs for downloads

### 5. AI Processing

- **Provider**: OpenAI API
- **Models**: GPT-4 (or GPT-4 Turbo) for analysis
- **Library**: Vercel AI SDK for streaming responses
- **PDF Processing**: pdf-parse or pdfjs-dist for text extraction

### 6. External Services

- **Stripe**: Payment processing and subscription management
- **Resend**: Email notifications (report ready, billing, etc.)

## Data Flow

### Contract Upload & Analysis Flow

1. User uploads PDF via frontend
2. Frontend sends file to backend API
3. Backend uploads PDF to S3
4. Backend extracts text from PDF
5. Backend sends extracted text to OpenAI for analysis
6. Backend stores analysis results in database
7. Backend sends email notification via Resend
8. User views analysis report in frontend

### Contract Comparison Flow

1. User uploads new contract PDF
2. Backend analyzes new contract (same as above)
3. Backend retrieves previous contract analysis
4. Backend compares new vs. old using AI
5. Backend generates comparison report
6. Backend stores comparison in database
7. Backend sends email notification
8. User views comparison report

## Security Considerations

- **Authentication**: Better-Auth with secure session management
- **Authorization**: Role-based access control (user can only access their own contracts)
- **File Upload**: Validation, virus scanning, size limits
- **API Security**: Rate limiting, CORS, input validation
- **Data Encryption**: Encrypted at rest (S3), encrypted in transit (HTTPS)
- **API Keys**: Stored securely in environment variables

## Scalability Considerations

- **File Processing**: Queue-based processing for large PDFs (future: Bull/BullMQ)
- **Database**: Indexed queries, connection pooling
- **CDN**: Static assets served via CDN
- **Caching**: Redis for frequently accessed data (future enhancement)

## Deployment Architecture

- **Frontend**: Vercel, Netlify, or similar
- **Backend**: Railway, Render, or AWS ECS/Lambda
- **Database**: Neon (managed PostgreSQL)
- **Storage**: AWS S3
- **Environment Variables**: Managed via hosting platform secrets
