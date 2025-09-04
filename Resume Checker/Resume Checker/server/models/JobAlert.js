// server/models/JobAlert.js
const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String], 
    default: []
  },
  locations: {
    type: [String],
    default: []
  },
  companies: {
    type: [String],
    default: []
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
jobAlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
jobAlertSchema.index({ userId: 1, isActive: 1 });
jobAlertSchema.index({ lastChecked: 1, isActive: 1 });

module.exports = mongoose.model('JobAlert', jobAlertSchema);
