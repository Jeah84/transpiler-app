import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  emailVerifySecret: process.env.EMAIL_VERIFY_SECRET ?? 'change-me-verify',
  togetherApiKey: process.env.TOGETHER_API_KEY!,
  brevoApiKey: process.env.BREVO_API_KEY!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:4000',
};
