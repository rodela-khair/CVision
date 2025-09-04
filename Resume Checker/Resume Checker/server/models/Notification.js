// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAlert',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['job_match', 'alert_created', 'alert_updated'],
    default: 'job_match'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  matchScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date,
    default: null
  }
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ alertId: 1, jobId: 1 }, { unique: true }); // Prevent duplicates

module.exports = mongoose.model('Notification', notificationSchema);
