const AnalyticsEvent = require('../models/AnalyticsEvent');

class AnalyticsService {
  static async logEvent(eventType, data = {}) {
    try {
      const timestamp = data.timestamp || new Date();
      const event = new AnalyticsEvent({
        eventType,
        userId: data.userId || null,
        jobId: data.jobId || null,
        resumeId: data.resumeId || null,
        metadata: data.metadata || {},
        timestamp,
        dateString: timestamp.toISOString().split('T')[0], // YYYY-MM-DD
        monthString: timestamp.toISOString().substr(0, 7) // YYYY-MM
      });
      
      await event.save();
      console.log(`Analytics event logged: ${eventType}`);
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  }

  static async getDashboardData(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get event totals
      const eventTotals = await AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get daily time series for the last 30 days
      const timeSeries = await AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: '$dateString',
              eventType: '$eventType'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);

      // Get top bookmarked jobs
      const topBookmarkedJobs = await AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'job_bookmarked',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$jobId',
            bookmarkCount: { $sum: 1 }
          }
        },
        { $sort: { bookmarkCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'jobs',
            localField: '_id',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $project: {
            jobId: '$_id',
            bookmarkCount: 1,
            title: '$job.title',
            company: '$job.company',
            requiredSkills: '$job.requiredSkills'
          }
        }
      ]);

      // Get skill analytics from resumes and jobs
      const skillAnalytics = await this.getSkillAnalytics();

      // Get user activity stats
      const userStats = await AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: startDate }, userId: { $ne: null } } },
        {
          $group: {
            _id: null,
            uniqueUsers: { $addToSet: '$userId' },
            totalEvents: { $sum: 1 }
          }
        },
        {
          $project: {
            uniqueUsers: { $size: '$uniqueUsers' },
            totalEvents: 1
          }
        }
      ]);

      return {
        eventTotals: eventTotals.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        timeSeries,
        topBookmarkedJobs,
        skillAnalytics,
        userStats: userStats[0] || { uniqueUsers: 0, totalEvents: 0 },
        dateRange: { startDate, endDate: new Date() }
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  static async getSkillAnalytics() {
    try {
      const Job = require('../models/Job');
      const Resume = require('../models/Resume');

      // Get all skills from jobs
      const jobSkills = await Job.aggregate([
        { $unwind: '$requiredSkills' },
        {
          $group: {
            _id: '$requiredSkills',
            jobCount: { $sum: 1 }
          }
        },
        { $sort: { jobCount: -1 } },
        { $limit: 20 }
      ]);

      // Get skills from resumes (assuming Resume model has extractedSkills field)
      const resumeSkills = await Resume.aggregate([
        { $match: { extractedSkills: { $exists: true, $ne: [] } } },
        { $unwind: '$extractedSkills' },
        {
          $group: {
            _id: '$extractedSkills',
            resumeCount: { $sum: 1 }
          }
        },
        { $sort: { resumeCount: -1 } },
        { $limit: 20 }
      ]).catch(() => []);

      // Find top skills (most demanded by jobs)
      const topSkills = jobSkills.slice(0, 10);

      // Find gap skills (skills in jobs but not common in resumes)
      const resumeSkillsSet = new Set(resumeSkills.map(s => s._id.toLowerCase()));
      const missingSkills = jobSkills
        .filter(skill => !resumeSkillsSet.has(skill._id.toLowerCase()))
        .slice(0, 10);

      return {
        topSkills,
        missingSkills,
        jobSkills: jobSkills.slice(0, 15),
        resumeSkills: resumeSkills.slice(0, 15)
      };
    } catch (error) {
      console.error('Failed to get skill analytics:', error);
      return {
        topSkills: [],
        missingSkills: [],
        jobSkills: [],
        resumeSkills: []
      };
    }
  }
}

module.exports = AnalyticsService;
