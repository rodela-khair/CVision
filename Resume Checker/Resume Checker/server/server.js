const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Routes
console.log('Loading routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('✓ Auth routes loaded');
app.use('/api/resume', require('./routes/resume'));
console.log('✓ Resume routes loaded');
app.use('/api/jobs', require('./routes/jobs'));
console.log('✓ Jobs routes loaded');
app.use('/api/match', require('./routes/match'));
console.log('✓ Match routes loaded');
app.use('/api/bookmarks', require('./routes/bookmarks'));
console.log('✓ Bookmarks routes loaded');
try {
  app.use('/api/analytics', require('./routes/analytics'));
  console.log('✓ Analytics routes loaded');
} catch (error) {
  console.error('✗ Failed to load analytics routes:', error);
}
try {
  app.use('/api/skill-gap', require('./routes/skillGap'));
  console.log('✓ Skill gap routes loaded');
} catch (error) {
  console.error('✗ Failed to load skill gap routes:', error);
}
try {
  app.use('/api/job-alerts', require('./routes/jobAlerts'));
  console.log('✓ Job alerts routes loaded');
} catch (error) {
  console.error('✗ Failed to load job alerts routes:', error);
}
try {
  app.use('/api/resume-tips', require('./routes/resumeTips'));
  console.log('✓ Resume tips routes loaded');
} catch (error) {
  console.error('✗ Failed to load resume tips routes:', error);
}
try {
  app.use('/api/feedback', require('./routes/feedback'));
  console.log('✓ Feedback routes loaded');
} catch (error) {
  console.error('✗ Failed to load feedback routes:', error);
}
try {
  const { router: notificationsRouter, alertChecker } = require('./services/alertChecker');
  app.use('/api/notifications', require('./routes/notifications'));
  console.log('✓ Notifications routes loaded');
  
  // Start the alert checker service
  alertChecker.startChecker();
  console.log('✓ Alert checker service started');
} catch (error) {
  console.error('✗ Failed to load notifications/alert checker:', error);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));