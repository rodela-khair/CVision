// server/services/alertChecker.js
const JobAlert = require('../models/JobAlert');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

class AlertChecker {
  constructor() {
    this.isRunning = false;
  }

  async startChecker() {
    if (this.isRunning) {
      console.log('Alert checker is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting job alert checker...');
    
    // Check every hour (since we now have instant notifications for new jobs)
    this.intervalId = setInterval(() => {
      this.checkAllAlerts();
    }, 60 * 60 * 1000); // 1 hour

    // Run initial check
    await this.checkAllAlerts();
  }

  stopChecker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Alert checker stopped');
  }

  async checkAllAlerts() {
    try {
      console.log('🔍 Checking job alerts...');
      
      const now = new Date();
      const activeAlerts = await JobAlert.find({ isActive: true });

      let totalMatches = 0;

      for (const alert of activeAlerts) {
        try {
          const shouldCheck = this.shouldCheckAlert(alert, now);
          if (!shouldCheck) continue;

          const newMatches = await this.checkAlertForMatches(alert);
          totalMatches += newMatches.length;

          if (newMatches.length > 0) {
            // Create notifications
            await this.createNotifications(alert, newMatches);

            // Update last checked time
            alert.lastChecked = now;
            await alert.save();
          }
        } catch (error) {
          console.error(`Error checking alert ${alert._id}:`, error);
        }
      }

      console.log(`✅ Alert check complete: ${totalMatches} new matches found`);
    } catch (error) {
      console.error('Error in alert checker:', error);
    }
  }

  // New method: Check alerts instantly for a specific new job
  async checkAlertsForNewJob(newJob) {
    try {
      console.log(`🚀 Instantly checking alerts for new job: ${newJob.title}`);
      
      const activeAlerts = await JobAlert.find({ isActive: true });
      let totalNotifications = 0;

      for (const alert of activeAlerts) {
        try {
          // Check if this job matches the alert criteria
          if (await this.doesJobMatchAlert(newJob, alert)) {
            // Check if notification already exists
            const existingNotification = await Notification.findOne({
              alertId: alert._id,
              jobId: newJob._id
            });

            if (!existingNotification) {
              // Create notification
              await this.createNotifications(alert, [newJob]);
              totalNotifications++;
              console.log(`📢 Instant notification created for alert: ${alert.name}`);
            }
          }
        } catch (error) {
          console.error(`Error checking alert ${alert._id} for new job:`, error);
        }
      }

      console.log(`✅ Instant alert check complete: ${totalNotifications} notifications created`);
      return totalNotifications;
    } catch (error) {
      console.error('Error in instant alert checker:', error);
      return 0;
    }
  }

  // Helper method to check if a single job matches an alert
  async doesJobMatchAlert(job, alert) {
    // Skills matching
    if (alert.skills && alert.skills.length > 0) {
      const matchesSkills = alert.skills.some(skill => 
        job.requiredSkills && job.requiredSkills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (matchesSkills) return true;
    }

    // Location matching
    if (alert.locations && alert.locations.length > 0) {
      const matchesLocation = alert.locations.some(location =>
        job.location && job.location.toLowerCase().includes(location.toLowerCase())
      );
      if (matchesLocation) return true;
    }

    // Company matching
    if (alert.companies && alert.companies.length > 0) {
      const matchesCompany = alert.companies.some(company =>
        job.company && job.company.toLowerCase().includes(company.toLowerCase())
      );
      if (matchesCompany) return true;
    }

    // If no criteria match, return false
    return false;
  }

  shouldCheckAlert(alert, now) {
    const timeSinceLastCheck = now - alert.lastChecked;
    const hoursSinceLastCheck = timeSinceLastCheck / (1000 * 60 * 60);

    if (alert.frequency === 'daily') {
      return hoursSinceLastCheck >= 24;
    } else if (alert.frequency === 'weekly') {
      return hoursSinceLastCheck >= 168; // 7 days * 24 hours
    }

    // Default to checking if more than 1 hour has passed
    return hoursSinceLastCheck >= 1;
  }

  async checkAlertForMatches(alert) {
    try {
      // Build query based on alert criteria
      let query = {};
      let matchConditions = [];

      // Only check jobs created since last check
      const sinceLastCheck = new Date(alert.lastChecked);
      query.createdAt = { $gt: sinceLastCheck };

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

      // If no specific criteria, match based on any new jobs (but this would be too broad)
      // So we require at least one matching criteria
      if (matchConditions.length === 0) {
        console.log(`Alert "${alert.name}" has no matching criteria, skipping...`);
        return [];
      }

      // Combine conditions with OR logic (job matches if it satisfies any criteria)
      query.$or = matchConditions;

      const jobs = await Job.find(query).sort({ createdAt: -1 });

      // Filter out jobs that already have notifications for this alert
      const existingNotifications = await Notification.find({
        alertId: alert._id,
        jobId: { $in: jobs.map(job => job._id) }
      });

      const existingJobIds = existingNotifications.map(n => n.jobId.toString());
      const newJobs = jobs.filter(job => !existingJobIds.includes(job._id.toString()));

      console.log(`Alert "${alert.name}": Found ${newJobs.length} new matching jobs`);
      return newJobs;
    } catch (error) {
      console.error('Error finding matching jobs for alert:', error);
      return [];
    }
  }

  async createNotifications(alert, matchingJobs) {
    try {
      const notifications = matchingJobs.map(job => ({
        userId: alert.userId,
        alertId: alert._id,
        jobId: job._id,
        title: `New Job Match: ${job.title}`,
        message: `A new job "${job.title}" at ${job.company} matches your alert "${alert.name}"`,
        type: 'job_match',
        matchScore: this.calculateMatchScore(alert, job)
      }));

      await Notification.insertMany(notifications);
      console.log(`📢 Created ${notifications.length} notifications for alert: ${alert.name}`);
    } catch (error) {
      console.error('Error creating notifications:', error);
    }
  }

  calculateMatchScore(alert, job) {
    let score = 0;
    let totalCriteria = 0;

    // Skills match
    if (alert.skills && alert.skills.length > 0) {
      totalCriteria++;
      const matchingSkills = alert.skills.filter(alertSkill =>
        job.requiredSkills && job.requiredSkills.some(jobSkill =>
          jobSkill.toLowerCase().includes(alertSkill.toLowerCase())
        )
      );
      if (matchingSkills.length > 0) {
        score += matchingSkills.length / alert.skills.length;
      }
    }

    // Location match
    if (alert.locations && alert.locations.length > 0) {
      totalCriteria++;
      const matches = alert.locations.some(location =>
        job.location && job.location.toLowerCase().includes(location.toLowerCase())
      );
      if (matches) score++;
    }

    // Company match
    if (alert.companies && alert.companies.length > 0) {
      totalCriteria++;
      const matches = alert.companies.some(company =>
        job.company && job.company.toLowerCase().includes(company.toLowerCase())
      );
      if (matches) score++;
    }

    return totalCriteria > 0 ? Math.round((score / totalCriteria) * 100) : 0;
  }
}

// Create singleton instance
const alertChecker = new AlertChecker();

module.exports = { alertChecker };
