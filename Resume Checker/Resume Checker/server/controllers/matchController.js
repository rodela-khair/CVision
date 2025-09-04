// server/controllers/matchController.js
const Resume = require('../models/Resume');
const Job    = require('../models/Job');
const AnalyticsService = require('../services/AnalyticsService');

function normalize(s) {
  return s
    .replace(/\s*\(.*?\)/g, '')     // remove "(...)" and preceding space
    .replace(/[^a-zA-Z0-9\s-]/g, '')// remove punctuation
    .trim()
    .toLowerCase();
}

exports.matchJobs = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ msg: 'Resume not found' });

    // build normalized set of user skills
    const userSkills = new Set(
      resume.parsedData.skills
        .map(normalize)
        .filter(Boolean)
    );

    const jobs = await Job.find();
    const scored = jobs.map(job => {
      // normalize the job's requiredSkills too
      const jobSkills = new Set(
        job.requiredSkills
          .map(normalize)
          .filter(Boolean)
      );

      // compute Jaccard index
      const intersection = [...userSkills].filter(x => jobSkills.has(x));
      const union = new Set([...userSkills, ...jobSkills]);
      const score = union.size > 0 ? intersection.length / union.size : 0;

      return { job, score };
    });

    // keep only those with at least one overlap
    const positive = scored
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    // Log analytics event
    await AnalyticsService.logEvent('match_run', {
      userId: req.user?.id,
      resumeId,
      metadata: {
        totalJobs: jobs.length,
        matchedJobs: positive.length,
        bestMatchScore: positive.length > 0 ? positive[0].score : 0,
        userSkillsCount: userSkills.size
      }
    });

    return res.json({ matches: positive });
  } catch (err) {
    console.error('matchJobs error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
