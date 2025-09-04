const AnalyticsService = require('../services/AnalyticsService');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.',
        expired: true 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.',
        invalid: true 
      });
    }
    
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

// Get dashboard analytics data
const getDashboard = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const dashboardData = await AnalyticsService.getDashboardData(days);
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Log an analytics event (for manual testing or external triggers)
const logEvent = async (req, res) => {
  try {
    const { eventType, userId, jobId, resumeId, metadata } = req.body;
    
    await AnalyticsService.logEvent(eventType, {
      userId,
      jobId,
      resumeId,
      metadata
    });
    
    res.json({
      success: true,
      message: 'Event logged successfully'
    });
  } catch (error) {
    console.error('Log event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log event',
      error: error.message
    });
  }
};

// Get detailed event logs with filtering and pagination
const getEventLogs = async (req, res) => {
  try {
    const {
      eventType,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const AnalyticsEvent = require('../models/AnalyticsEvent');
    
    let query = {};
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const events = await AnalyticsEvent
      .find(query)
      .populate('userId', 'email')
      .populate('jobId', 'title company')
      .populate('resumeId', 'fileName')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await AnalyticsEvent.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalEvents,
          pages: Math.ceil(totalEvents / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Event logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event logs',
      error: error.message
    });
  }
};

module.exports = {
  requireAdmin,
  getDashboard,
  logEvent,
  getEventLogs
};
