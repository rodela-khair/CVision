const User = require('../models/User');
const Job = require('../models/Job');
const AnalyticsService = require('../services/AnalyticsService');

// Bookmark a job
exports.bookmarkJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Find user and check if job is already bookmarked
    const user = await User.findById(userId);
    if (user.bookmarkedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job already bookmarked' });
    }

    // Add job to bookmarks
    user.bookmarkedJobs.push(jobId);
    await user.save();

    res.json({ 
      message: 'Job bookmarked successfully',
      bookmarkedJobs: user.bookmarkedJobs
    });
  } catch (error) {
    console.error('Bookmark job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove bookmark
exports.removeBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const bookmarkIndex = user.bookmarkedJobs.indexOf(jobId);

    if (bookmarkIndex === -1) {
      return res.status(400).json({ message: 'Job not bookmarked' });
    }

    // Remove job from bookmarks
    user.bookmarkedJobs.splice(bookmarkIndex, 1);
    await user.save();

    res.json({ 
      message: 'Bookmark removed successfully',
      bookmarkedJobs: user.bookmarkedJobs
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookmarked jobs for user
exports.getBookmarkedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'bookmarkedJobs',
        model: 'Job'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Bookmarked jobs retrieved successfully',
      bookmarkedJobs: user.bookmarkedJobs
    });
  } catch (error) {
    console.error('Get bookmarked jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle bookmark (bookmark if not bookmarked, remove if bookmarked)
exports.toggleBookmark = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedJobs.includes(jobId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarkedJobs = user.bookmarkedJobs.filter(id => id.toString() !== jobId);
      await user.save();
      
      // Log analytics event
      await AnalyticsService.logEvent('job_unbookmarked', {
        userId,
        jobId,
        metadata: { jobTitle: job.title, company: job.company }
      });
      
      res.json({ 
        message: 'Bookmark removed',
        isBookmarked: false,
        bookmarkedJobs: user.bookmarkedJobs
      });
    } else {
      // Add bookmark
      user.bookmarkedJobs.push(jobId);
      await user.save();
      
      // Log analytics event
      await AnalyticsService.logEvent('job_bookmarked', {
        userId,
        jobId,
        metadata: { jobTitle: job.title, company: job.company }
      });
      
      res.json({ 
        message: 'Job bookmarked',
        isBookmarked: true,
        bookmarkedJobs: user.bookmarkedJobs
      });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if a job is bookmarked by user
exports.isJobBookmarked = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isBookmarked = user.bookmarkedJobs.includes(jobId);

    res.json({ isBookmarked });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
