import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import StationConfig from './models/StationConfig.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Ensure station desk-2 configuration document exists on boot
export async function ensureStationConfig() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const existing = await StationConfig.findOne({ stationId: 'desk-2' });
    if (!existing) {
      await StationConfig.create({
        stationId: 'desk-2',
        stationName: 'PrintFlow Desk #2 · Central Campus Library',
        isOpen: true,
        printerModel: 'Canon iR-ADV C5560',
        printerStatus: 'Ready',
        trayLevelA4: 84,
        tonerLevel: 'Normal',
        rates: { bwPerPage: 2, colorPerPage: 8, a3Multiplier: 1.5 },
      });
      console.log('[Server] StationConfig (desk-2) initialized.');
    }
  } catch (err) {
    console.error('[Server Error] Failed to ensure station config:', err.message);
  }
}
await ensureStationConfig();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    status: 'ok',
    db: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Middleware to check DB connectivity for API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not connected. Please ensure MongoDB is running at mongodb://localhost:27017 or provide your Atlas MONGO_URI in server/.env.',
    });
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/station', stationRoutes);

// 404 Catch-All Handler (before error middleware)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] PrintFlow backend listening on http://localhost:${PORT}`);
});
