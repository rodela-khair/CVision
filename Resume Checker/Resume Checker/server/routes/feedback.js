const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// Submit feedback/contact form (public endpoint - no auth required)
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get user ID if authenticated
    let userId = null;
    if (req.headers.authorization) {
      try {
        const authMiddleware = require('../middleware/auth');
        authMiddleware(req, res, () => {
          userId = req.user?.id || null;
        });
      } catch (error) {
        // Not authenticated, but that's okay for contact forms
      }
    }

    // Auto-categorize based on subject/message content
    let autoCategory = category || 'general-inquiry';
    const content = (subject + ' ' + message).toLowerCase();
    
    if (content.includes('bug') || content.includes('error') || content.includes('problem')) {
      autoCategory = 'bug-report';
    } else if (content.includes('feature') || content.includes('suggestion') || content.includes('improve')) {
      autoCategory = 'feature-request';
    } else if (content.includes('help') || content.includes('support') || content.includes('issue')) {
      autoCategory = 'technical-support';
    } else if (content.includes('feedback') || content.includes('review')) {
      autoCategory = 'feedback';
    }

    // Auto-assign priority based on keywords
    let priority = 'medium';
    if (content.includes('urgent') || content.includes('critical') || content.includes('important')) {
      priority = 'high';
    } else if (content.includes('minor') || content.includes('suggestion')) {
      priority = 'low';
    }

    const feedback = new Feedback({
      name,
      email,
      subject,
      message,
      userId,
      category: autoCategory,
      priority,
      status: 'new'
    });

    await feedback.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback! We\'ll get back to you soon.',
      ticketId: feedback._id
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: error.message
    });
  }
});

// Get all feedback (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;

    // Build filter query
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;

    // Get feedback with pagination
    const feedback = await Feedback.find(filter)
      .populate('userId', 'email username')
      .populate('resolvedBy', 'email username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    // Get statistics
    const stats = {
      total: await Feedback.countDocuments(),
      new: await Feedback.countDocuments({ status: 'new' }),
      inProgress: await Feedback.countDocuments({ status: 'in-progress' }),
      resolved: await Feedback.countDocuments({ status: 'resolved' }),
      byCategory: {},
      byPriority: {}
    };

    // Get category and priority breakdowns
    const categories = ['bug-report', 'feature-request', 'general-inquiry', 'technical-support', 'feedback', 'other'];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    for (const cat of categories) {
      stats.byCategory[cat] = await Feedback.countDocuments({ category: cat });
    }

    for (const pri of priorities) {
      stats.byPriority[pri] = await Feedback.countDocuments({ priority: pri });
    }

    res.json({
      success: true,
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Update feedback status/notes (admin only)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, adminNotes, priority } = req.body;
    const feedbackId = req.params.id;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (priority) updateData.priority = priority;

    // Set resolvedAt and resolvedBy if status is resolved or closed
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.id;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      updateData,
      { new: true }
    ).populate('userId', 'email username')
     .populate('resolvedBy', 'email username');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: error.message
    });
  }
});

// Delete feedback (admin only)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
});

module.exports = router;
