const SkillGapService = require('../services/SkillGapService');
const jwt = require('jsonwebtoken');

// Middleware to extract user from token (optional authentication)
const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Continue without user authentication for public access
    next();
  }
};

// Get skill gap analysis for a specific resume against a specific job
const getJobSkillGap = async (req, res) => {
  try {
    const { resumeId, jobId } = req.params;
    
    if (!resumeId || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID and Job ID are required'
      });
    }

    const analysis = await SkillGapService.getResumeJobSkillGap(resumeId, jobId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze skill gap',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get skill gap analysis for a resume against multiple top jobs
const getMultiJobSkillGap = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required'
      });
    }

    const analysis = await SkillGapService.getResumeMultiJobSkillGap(resumeId, limit);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Multi-job skill gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze skill gaps',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get skill recommendations for a resume
const getSkillRecommendations = async (req, res) => {
  try {
    const { resumeId } = req.params;
    
    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required'
      });
    }

    const recommendations = await SkillGapService.getSkillRecommendations(resumeId);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Skill recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get skill recommendations',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get aggregated skill gap insights (for analytics)
const getSkillGapInsights = async (req, res) => {
  try {
    // This could be expanded to provide market-wide skill gap insights
    const insights = {
      message: 'Skill gap insights endpoint - can be expanded for market analysis',
      timestamp: new Date()
    };
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Skill gap insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skill gap insights'
    });
  }
};

module.exports = {
  optionalAuth,
  getJobSkillGap,
  getMultiJobSkillGap,
  getSkillRecommendations,
  getSkillGapInsights
};
