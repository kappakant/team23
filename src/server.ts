// src/server.ts
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// ============================================
// DEBUG: Print environment variables
// ============================================
console.log('==========================================');
console.log('ENVIRONMENT VARIABLES DEBUG:');
console.log('==========================================');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*** (set)' : 'NOT SET ❌');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('==========================================');

// Now import other modules
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow requests from React app
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PumpPal API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('==========================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'NOT SET'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'NOT SET'}`);
  console.log('==========================================');
});