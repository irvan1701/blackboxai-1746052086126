require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { initializeDatabase } = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budget');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', authMiddleware, incomeRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/budget', authMiddleware, budgetRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Schedule daily database backup
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running daily database backup...');
    // Implement backup logic here
  } catch (error) {
    console.error('Database backup failed:', error);
  }
});

// Schedule weekly budget alerts
cron.schedule('0 9 * * MON', async () => {
  try {
    console.log('Checking budget alerts...');
    // Implement budget check and notification logic here
  } catch (error) {
    console.error('Budget alert check failed:', error);
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
