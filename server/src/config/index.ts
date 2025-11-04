import { config as loadEnv } from "dotenv";

loadEnv();

export const appConfig = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || "3001"}`,

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY!,

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION || "us-east-1",
    bucketName: process.env.S3_BUCKET_NAME!,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },

  // Resend
  resend: {
    apiKey: process.env.RESEND_API_KEY!,
  },

  // Better Auth
  betterAuth: {
    secret: process.env.BETTER_AUTH_SECRET!,
    url: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || "3001"}`,
  },

  // Configuration
  humanReviewPriceCents: parseInt(process.env.HUMAN_REVIEW_PRICE_CENTS || "15000", 10),
};

export default appConfig;

// Validate required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
  "STRIPE_SECRET_KEY",
  "RESEND_API_KEY",
  "BETTER_AUTH_SECRET",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

