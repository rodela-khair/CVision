const express = require('express');
const router = express.Router();
const {
  optionalAuth,
  getJobSkillGap,
  getMultiJobSkillGap,
  getSkillRecommendations,
  getSkillGapInsights
} = require('../controllers/skillGapController');

// Apply optional authentication to all routes (public access allowed)
router.use(optionalAuth);

// GET /api/skill-gap/resume/:resumeId/job/:jobId - Get skill gap for specific resume-job pair
router.get('/resume/:resumeId/job/:jobId', getJobSkillGap);

// GET /api/skill-gap/resume/:resumeId/multi-job?limit=10 - Get skill gaps for resume against top jobs
router.get('/resume/:resumeId/multi-job', getMultiJobSkillGap);

// GET /api/skill-gap/resume/:resumeId/recommendations - Get skill recommendations for resume
router.get('/resume/:resumeId/recommendations', getSkillRecommendations);

// GET /api/skill-gap/insights - Get general skill gap insights (for analytics)
router.get('/insights', getSkillGapInsights);

module.exports = router;
