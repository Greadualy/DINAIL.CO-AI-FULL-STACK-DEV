const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const consultationRoutes = require('./routes/consultation.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Dinail.co Backend API Server',
    endpoints: {
      health: '/api/health',
      products: '/api/v1/products',
      authSync: '/api/v1/auth/sync',
      consultations: '/api/v1/consultations',
      aiAnalyze: '/api/v1/ai/analyze-nails',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend Dinail.co API is healthy and operational.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  const status = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';
  const safeMessage = (status >= 500 && !isDev)
    ? 'Terjadi kesalahan internal pada server.'
    : (err.message || 'Terjadi kesalahan pada server.');

  res.status(status).json({
    success: false,
    message: safeMessage,
    ...(isDev ? { stack: err.stack } : {}),
  });
});

module.exports = app;
