import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import accommodationRoutes from './routes/accommodationRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'TravelGenie AI Server',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/transport', transportRoutes);
  app.use('/api/accommodations', accommodationRoutes);
  app.use('/api/itinerary', itineraryRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/ai', aiRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
