// Load environment variables first before any other imports
import { config } from 'dotenv';
import path from 'path';

// Get the root directory of the project and load .env file
const envPath = path.resolve(__dirname, '../.env');
config({ path: envPath });

import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
// import { supabaseAdmin } from './config/supabase';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import codeRoutes from './routes/code.routes';
import youtubeRoutes from './routes/youtube.routes';
import musicRoutes from './routes/music.routes';

const app = express();
const port = process.env.PORT || 3001;

// Log available environment variables for debugging
console.log('Environment variables in index.ts:');
console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/music', musicRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
