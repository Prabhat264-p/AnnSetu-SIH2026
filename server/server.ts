import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { PORT, MONGODB_URI } from './config/constants';

import authRoutes from './routes/auth.routes';
import farmerRoutes from './routes/farmer.routes';
import centreRoutes from './routes/centre.routes';
import bookingRoutes from './routes/booking.routes';
import tokenRoutes from './routes/token.routes';
import operatorRoutes from './routes/operator.routes';
import adminRoutes from './routes/admin.routes';
import devRoutes from './routes/dev.routes';
import voiceRoutes from './routes/voice.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let isMongoConnected = false;

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
  })
  .catch(() => {
    console.log('⚡ MongoDB not available. Operating seamlessly on In-Memory Resilient Store.');
  });

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'annsetu',
    app: 'AnnSetu Procurement Engine',
    version: '1.0.0',
    database: isMongoConnected ? 'MongoDB (Active)' : 'In-Memory Resilient Store (Active)',
    timestamp: new Date().toISOString(),
  });
});

// Register Modular API Routers
app.use('/api', authRoutes);
app.use('/api', farmerRoutes);
app.use('/api', centreRoutes);
app.use('/api', bookingRoutes);
app.use('/api', tokenRoutes);
app.use('/api', operatorRoutes);
app.use('/api', adminRoutes);
app.use('/api', devRoutes);
app.use('/api', voiceRoutes);

// Serve Production Static Build Assets from dist/
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA Fallback: Any non-API route returns React index.html
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Application build not found. Please run npm run build first.');
    }
  });
});

export const server = app.listen(PORT, () => {
  console.log(`🚀 AnnSetu REST API Server running on port ${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const ALT_PORT = Number(PORT) + 1;
    console.log(`Port ${PORT} in use, falling back to port ${ALT_PORT}`);
    app.listen(ALT_PORT, () => {
      console.log(`🚀 AnnSetu REST API Server running on port ${ALT_PORT}`);
    });
  }
});

export default app;
