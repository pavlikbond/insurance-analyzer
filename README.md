# Insurance Analyzer

A web application that helps users analyze their insurance contracts using AI. Upload your insurance PDFs, receive AI-powered analysis, and compare contracts year-over-year to identify changes in terms and coverage.

## Features

- 📄 **Contract Upload**: Upload insurance contract PDFs
- 🤖 **AI Analysis**: Automatic analysis of terms, coverage, and exclusions
- 📊 **Year-over-Year Comparison**: Compare new contracts with previous years
- 👤 **Human Review**: Request expert review (upsell feature)
- 💳 **Billing**: Stripe integration for subscriptions
- 📧 **Notifications**: Email notifications via Resend

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Fastify, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Storage**: AWS S3
- **AI**: OpenAI API (GPT-4)
- **Auth**: Better-Auth
- **Payments**: Stripe
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- PostgreSQL (Neon account)
- AWS S3 account
- OpenAI API key
- Stripe account
- Resend account

### Environment Variables

Create a `.env` file in the root directory:

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
```

### Installation

```bash
# Install dependencies
npm install

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### Development

```bash
# Start backend server
cd server
npm run dev

# Start frontend (in another terminal)
cd client
npm run dev
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Technical Stack](./docs/TECH_STACK.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Specification](./docs/API_SPECIFICATION.md)
- [Frontend Specification](./docs/FRONTEND_SPECIFICATION.md)
- [Feature Requirements](./docs/FEATURE_REQUIREMENTS.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)

## Project Structure

```
insurance-analyzer/
├── client/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Fastify backend
│   ├── src/
│   └── package.json
├── docs/           # Documentation
└── package.json     # Root package.json
```

## License

MIT
