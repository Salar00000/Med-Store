import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.js';
import productsRoutes from './routes/products.routes.js';
import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import promoRoutes from './routes/promo.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';

dotenv.config();

export const app = express();

// ── Security & performance middleware ──────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());

// ── Rate limiting ──────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use(notFound);
app.use(errorHandler);
