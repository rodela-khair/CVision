const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['resume_upload', 'match_run', 'job_bookmarked', 'job_unbookmarked', 'job_applied']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Some events might not have a user (e.g., anonymous uploads)
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false // Not all events are job-related
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: false // Not all events are resume-related
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Store additional event data
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // For aggregation and quick queries
  dateString: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true
  },
  monthString: {
    type: String, // Format: 'YYYY-MM'
    required: true
  }
});

// Indexes for performance
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ dateString: 1 });
AnalyticsEventSchema.index({ monthString: 1 });
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });

// Pre-save middleware to set date strings
AnalyticsEventSchema.pre('save', function(next) {
  const date = new Date(this.timestamp);
  this.dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  this.monthString = date.toISOString().substr(0, 7); // YYYY-MM
  next();
});

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
