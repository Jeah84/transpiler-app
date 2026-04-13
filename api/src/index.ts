import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log('ENV CHECK v2:', {
    hasJwtSecret: !!env.jwtSecret,
    jwtSecretLength: env.jwtSecret?.length,
    hasEmailVerifySecret: !!env.emailVerifySecret,
    emailVerifySecretLength: env.emailVerifySecret?.length,
    hasStripeKey: !!env.stripeSecretKey,
    stripeKeyLength: env.stripeSecretKey?.length,
    hasDatabaseUrl: !!env.databaseUrl,
    hasFrontendUrl: !!env.frontendUrl,
    hasBrevoKey: !!env.brevoApiKey,
    hasTogetherKey: !!env.togetherApiKey,
  });
});
