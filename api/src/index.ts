import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log('ENV CHECK:', {
    hasJwtSecret: !!env.jwtSecret,
    jwtSecretLength: env.jwtSecret?.length,
    hasEmailVerifySecret: !!env.emailVerifySecret,
    emailVerifySecretLength: env.emailVerifySecret?.length,
    hasDatabaseUrl: !!env.databaseUrl,
    hasFrontendUrl: !!env.frontendUrl,
  });
});
