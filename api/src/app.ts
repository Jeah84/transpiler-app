import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';
import authRoutes from './routes/auth';
import translateRoutes from './routes/translate';
import paymentRoutes from './routes/payment';

const app = express();

// CORS
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

// Stripe webhook needs raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Parse JSON for all other routes
app.use(express.json({ limit: '1mb' }));
app.use(compression());

app.get('/healthz', (_req, res) => {
  res.status(200).send('ok');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
