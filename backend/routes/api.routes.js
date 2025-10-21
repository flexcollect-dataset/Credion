const express = require('express');
const router = express.Router();

// Example API endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Credion API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/auth'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes are now in app.js directly
// Removed to prevent duplicate routes

// Search functionality moved to frontend - direct API calls to Australian Business Register

// Add more routes here as needed
// router.use('/users', require('./users.routes'));

module.exports = router;

