const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const habitRoutes = require('./routes/habitRoutes');
const templateRoutes = require('./routes/templateRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { scheduleDailyReminders } = require('./services/scheduler');
const { scheduleAutomationTasks } = require('./services/automationService');

// Import models to initialize associations
require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subtasks', subtaskRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint to verify routing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    routes: {
      login: 'POST /api/users/login',
      health: 'GET /api/health',
      tasks: 'GET /api/tasks'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  console.log(`   Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'POST /api/users/login',
      'GET /api/users/me',
      'GET /api/tasks',
      'POST /api/tasks',
      'GET /api/health'
    ]
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    console.log('🚀 Starting Task Tracker Backend Server...\n');
    
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.error('\n❌ Failed to connect to database.');
      console.error('Please check your database configuration and try again.\n');
      process.exit(1);
    }

    // Sync database models (create tables if they don't exist)
    // In production, use migrations instead
    if (process.env.SYNC_DB === 'true') {
      console.log('📊 Syncing database tables...');
      await sequelize.sync({ alter: false });
      console.log('✅ Database tables synced\n');
    }

    // Start scheduled reminders
    scheduleDailyReminders();
    console.log('⏰ Daily reminder scheduler started');
    
    // Start automation tasks
    scheduleAutomationTasks();
    console.log('🤖 Automation tasks scheduled\n');

    // Start server
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════');
      console.log('✅ Server is running successfully!');
      console.log(`📍 Backend API: http://localhost:${PORT}`);
      console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
      console.log('═══════════════════════════════════════════════\n');
      console.log('💡 Keep this terminal open to keep the server running!\n');
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    console.error('\n💡 Check the error above and verify:');
    console.error('   - MySQL/MariaDB is running');
    console.error('   - Database "tasktracker" exists');
    console.error('   - .env file is configured correctly\n');
    process.exit(1);
  }
};

startServer();

module.exports = app;
