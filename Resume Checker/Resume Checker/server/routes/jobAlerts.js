// server/routes/jobAlerts.js
const express = require('express');
const router = express.Router();
const JobAlert = require('../models/JobAlert');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Get all job alerts for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await JobAlert.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({ message: 'Error fetching job alerts' });
  }
});

// Create new job alert
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      skills,
      locations,
      companies,
      frequency
    } = req.body;

    const alert = new JobAlert({
      userId: req.user.id,
      name,
      skills: skills || [],
      locations: locations || [],
      companies: companies || [],
      frequency
    });

    await alert.save();

    // Create notification for alert creation
    const notification = new Notification({
      userId: req.user.id,
      alertId: alert._id,
      jobId: alert._id, // Use alert ID as placeholder
      title: 'Job Alert Created',
      message: `Your job alert "${name}" has been created successfully`,
      type: 'alert_created'
    });
    await notification.save();

    res.status(201).json({ 
      message: 'Job alert created successfully',
      alert 
    });
  } catch (error) {
    console.error('Error creating job alert:', error);
    res.status(500).json({ message: 'Error creating job alert' });
  }
});

// Update job alert
router.put('/:id', auth, async (req, res) => {
  try {
    const alert = await JobAlert.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!alert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    const updateData = { ...req.body };
    Object.assign(alert, updateData);
    await alert.save();

    res.json({ 
      message: 'Job alert updated successfully',
      alert 
    });
  } catch (error) {
    console.error('Error updating job alert:', error);
    res.status(500).json({ message: 'Error updating job alert' });
  }
});

// Toggle job alert active status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const alert = await JobAlert.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!alert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.json({ 
      message: `Job alert ${alert.isActive ? 'activated' : 'deactivated'}`,
      alert 
    });
  } catch (error) {
    console.error('Error toggling job alert:', error);
    res.status(500).json({ message: 'Error toggling job alert' });
  }
});

// Delete job alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const alert = await JobAlert.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!alert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    await JobAlert.deleteOne({ _id: req.params.id });
    
    // Delete associated notifications
    await Notification.deleteMany({ alertId: req.params.id });

    res.json({ message: 'Job alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    res.status(500).json({ message: 'Error deleting job alert' });
  }
});

// Test job alert (find matching jobs now)
router.post('/:id/test', auth, async (req, res) => {
  try {
    const alert = await JobAlert.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!alert) {
      return res.status(404).json({ message: 'Job alert not found' });
    }

    // Find matching jobs using the same logic as the checker
    const matchingJobs = await findMatchingJobsForAlert(alert);

    res.json({ 
      message: `Found ${matchingJobs.length} matching jobs`,
      matches: matchingJobs.slice(0, 10) // Limit to 10 for testing
    });
  } catch (error) {
    console.error('Error testing job alert:', error);
    res.status(500).json({ message: 'Error testing job alert' });
  }
});

// Helper function to find matching jobs for an alert
async function findMatchingJobsForAlert(alert) {
  try {
    let query = {};
    let matchConditions = [];

    // Skills matching
    if (alert.skills && alert.skills.length > 0) {
      const skillsRegex = alert.skills.map(skill => new RegExp(skill, 'i'));
      matchConditions.push({
        requiredSkills: { $in: skillsRegex }
      });
    }

    // Location matching
    if (alert.locations && alert.locations.length > 0) {
      const locationRegex = alert.locations.map(loc => new RegExp(loc, 'i'));
      matchConditions.push({
        location: { $in: locationRegex }
      });
    }

    // Company matching
    if (alert.companies && alert.companies.length > 0) {
      const companyRegex = alert.companies.map(comp => new RegExp(comp, 'i'));
      matchConditions.push({
        company: { $in: companyRegex }
      });
    }

    // Combine conditions with OR logic
    if (matchConditions.length > 0) {
      query.$or = matchConditions;
    } else {
      // Return empty array if no criteria specified
      return [];
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    return jobs;
  } catch (error) {
    console.error('Error finding matching jobs:', error);
    return [];
  }
}

module.exports = router;
