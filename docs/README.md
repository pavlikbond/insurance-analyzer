# Insurance Analyzer - Documentation

Welcome to the Insurance Analyzer project documentation. This directory contains comprehensive specifications for building a tool that analyzes insurance contracts using AI.

## Documentation Index

### 📐 [Architecture Overview](./ARCHITECTURE.md)
High-level system architecture, component interactions, and data flow diagrams. Start here to understand the overall system design.

### 🛠️ [Technical Stack](./TECH_STACK.md)
Detailed breakdown of all technologies, libraries, and tools used in the project. Includes package dependencies and environment variables.

### 🗄️ [Database Schema](./DATABASE_SCHEMA.md)
Complete database schema specification with table definitions, relationships, indexes, and data types. Uses Drizzle ORM with PostgreSQL.

### 🔌 [API Specification](./API_SPECIFICATION.md)
RESTful API endpoint documentation with request/response formats, error handling, and authentication requirements.

### 🎨 [Frontend Specification](./FRONTEND_SPECIFICATION.md)
Frontend architecture, component structure, pages, routes, and UI/UX specifications. Built with React, Tailwind, and shadcn/ui.

### ✨ [Feature Requirements](./FEATURE_REQUIREMENTS.md)
Detailed feature specifications, user stories, and non-functional requirements. Includes priority levels and success metrics.

### 📋 [Implementation Plan](./IMPLEMENTATION_PLAN.md)
Phased development plan with task breakdown, timeline estimates, and risk mitigation strategies.

### 🤖 [AI Prompt Specification](./AI_PROMPT_SPECIFICATION.md)
AI prompt templates, analysis focus areas, and structured response formats. Special focus on roofing/siding coverage analysis.

## Quick Start

### Prerequisites
- Node.js 20.x LTS
- PostgreSQL (Neon account)
- AWS S3 account
- OpenAI API key
- Stripe account
- Resend account

### Environment Variables

See [Technical Stack](./TECH_STACK.md#environment-variables) for complete list.

### Configuration

- **Human Review Price**: $150 (configurable via environment variable or config file)
- **Subscription Tiers**: Two tiers only (AI Analyzer, AI Analyzer Plus)
- **PDF Processing**: pdf-parse library
- **AI Model**: GPT-4 Turbo (configurable)

### Project Structure

```
insurance-analyzer/
├── client/          # React frontend
├── server/          # Fastify backend
├── docs/           # Documentation (this directory)
└── package.json     # Root package.json
```

## Key Features

1. **Contract Upload**: Users upload insurance PDFs
2. **AI Analysis**: Automatic analysis of contract terms, coverage, and exclusions
3. **Year-over-Year Comparison**: Compare new contracts with previous years
4. **Human Review**: Upsell feature for expert review
5. **Billing**: Stripe integration for subscriptions and payments
6. **Email Notifications**: Resend integration for user notifications

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Fastify, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Storage**: AWS S3
- **AI**: OpenAI API (GPT-4)
- **Auth**: Better-Auth
- **Payments**: Stripe
- **Email**: Resend

## Development Workflow

1. Review [Architecture Overview](./ARCHITECTURE.md)
2. Set up development environment (see [Technical Stack](./TECH_STACK.md))
3. Initialize database (see [Database Schema](./DATABASE_SCHEMA.md))
4. Follow [Implementation Plan](./IMPLEMENTATION_PLAN.md)
5. Reference [API Specification](./API_SPECIFICATION.md) for backend development
6. Reference [Frontend Specification](./FRONTEND_SPECIFICATION.md) for frontend development

## Questions & Clarifications

If you have questions about:
- **Architecture decisions**: See [Architecture Overview](./ARCHITECTURE.md)
- **Technology choices**: See [Technical Stack](./TECH_STACK.md)
- **Data structure**: See [Database Schema](./DATABASE_SCHEMA.md)
- **API endpoints**: See [API Specification](./API_SPECIFICATION.md)
- **UI/UX**: See [Frontend Specification](./FRONTEND_SPECIFICATION.md)
- **Features**: See [Feature Requirements](./FEATURE_REQUIREMENTS.md)
- **Timeline**: See [Implementation Plan](./IMPLEMENTATION_PLAN.md)

## Next Steps

1. Review all documentation
2. Set up development environment
3. Initialize project structure
4. Begin Phase 1 implementation (see [Implementation Plan](./IMPLEMENTATION_PLAN.md))

---

**Last Updated**: 2024-01-15

