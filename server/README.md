# Insurance Analyzer Backend Server

Fastify-based backend server for the Insurance Analyzer application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory (see `.env.example` for required variables)

3. Run database migrations:
```bash
npm run db:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Database

Generate migrations:
```bash
npm run db:generate
```

Run migrations:
```bash
npm run db:migrate
```

Open Drizzle Studio (database GUI):
```bash
npm run db:studio
```

## Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration and env variables
│   ├── db/             # Database schema and migrations
│   ├── middleware/     # Auth, error handling, etc.
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── index.ts        # Server entry point
├── package.json
└── tsconfig.json
```

