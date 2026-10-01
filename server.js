const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  });
});

// Version endpoint
app.get('/api/v1', (req, res) => {
  res.json({ 
    version: '1.0.0',
    name: 'School Smart Tracking API',
    description: 'Riyadh Primary School Tracking System'
  });
});

// Routes will be imported here
// app.use('/api/v1/auth', require('./api/routes/authRoutes'));
// app.use('/api/v1/students', require('./api/routes/studentRoutes'));
// app.use('/api/v1/teachers', require('./api/routes/teacherRoutes'));
// app.use('/api/v1/grades', require('./api/routes/gradeRoutes'));
// app.use('/api/v1/attendance', require('./api/routes/attendanceRoutes'));
// app.use('/api/v1/admin', require('./api/routes/adminRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 School Smart Tracking API`);
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[1]}`);
  console.log(`\n✅ Server ready to accept requests\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, prisma };
