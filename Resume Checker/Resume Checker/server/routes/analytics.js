const express = require('express');
const router = express.Router();

console.log('Analytics routes file loaded');

// Simple test route first
router.get('/test', (req, res) => {
  console.log('Analytics test route hit');
  res.json({ message: 'Analytics routes are working!' });
});

// Load the controller after we know the basic routing works
try {
  const {
    requireAdmin,
    getDashboard,
    logEvent,
    getEventLogs
  } = require('../controllers/analyticsController');

  // Admin-only routes
  router.get('/dashboard', (req, res, next) => {
    console.log('Analytics dashboard route hit');
    next();
  }, requireAdmin, getDashboard);

  router.get('/events', requireAdmin, getEventLogs);
  router.post('/log', requireAdmin, logEvent);
  
  console.log('Analytics admin routes configured');
} catch (error) {
  console.error('Failed to load analytics controller:', error);
}

console.log('Analytics routes module completed');
module.exports = router;
