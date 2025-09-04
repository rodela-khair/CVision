const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');

// Generate resume improvement tips based on parsed resume data and skill gaps
router.get('/generate', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's latest resume data
    const user = await User.findById(userId);
    const latestResume = await Resume.findOne({ user: userId }).sort({ uploadDate: -1 });
    
    if (!latestResume) {
      return res.status(404).json({ 
        success: false,
        message: 'No resume found. Please upload a resume first.' 
      });
    }

    // Get skill gap data if available
    const skillGapData = user.skillGapAnalysis || null;
    
    // Generate tips based on resume data and skill gaps
    const tips = generateResumeTips(latestResume, skillGapData, user);
    
    res.json({
      success: true,
      tips,
      resumeAnalyzed: latestResume.filename,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating resume tips:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate resume tips',
      error: error.message 
    });
  }
});

// Helper function to generate structured resume tips
function generateResumeTips(resume, skillGapData, user) {
  const tips = {
    skills: [],
    experience: [],
    ats: [],
    formatting: [],
    content: []
  };

  // Analyze parsed resume data
  const parsedData = resume.parsedData || {};
  const skills = parsedData.skills || [];
  const experience = parsedData.experience || [];
  const education = parsedData.education || [];
  const contact = parsedData.contact || {};

  // Skills-based tips
  if (skillGapData && skillGapData.missingSkills && skillGapData.missingSkills.length > 0) {
    tips.skills.push({
      priority: 'high',
      title: 'Address Skill Gaps',
      description: `Consider adding these in-demand skills: ${skillGapData.missingSkills.slice(0, 5).join(', ')}`,
      action: 'Add relevant courses, certifications, or projects that demonstrate these skills'
    });
  }

  if (skills.length < 8) {
    tips.skills.push({
      priority: 'medium',
      title: 'Expand Skills Section',
      description: 'Your skills section appears limited. Aim for 8-15 relevant technical and soft skills',
      action: 'Add industry-specific tools, programming languages, and soft skills relevant to your target role'
    });
  }

  if (skillGapData && skillGapData.matchingSkills && skillGapData.matchingSkills.length > 0) {
    tips.skills.push({
      priority: 'low',
      title: 'Highlight Matching Skills',
      description: `Emphasize these strong skills: ${skillGapData.matchingSkills.slice(0, 3).join(', ')}`,
      action: 'Move these skills to the top of your skills section and mention them in your summary'
    });
  }

  // Experience-based tips
  if (experience.length === 0) {
    tips.experience.push({
      priority: 'high',
      title: 'Add Work Experience',
      description: 'No work experience detected in your resume',
      action: 'Include internships, freelance work, volunteer positions, or relevant projects with measurable outcomes'
    });
  } else {
    // Check for quantified achievements
    const hasNumbers = experience.some(exp => 
      /\d+(%|\$|k|million|thousand|hours|years|projects|clients|users)/.test(exp.description || '')
    );
    
    if (!hasNumbers) {
      tips.experience.push({
        priority: 'high',
        title: 'Quantify Your Achievements',
        description: 'Your experience lacks measurable results and numbers',
        action: 'Add specific metrics like "Increased efficiency by 25%" or "Managed team of 5 developers"'
      });
    }

    // Check experience descriptions length
    const shortDescriptions = experience.filter(exp => 
      !exp.description || exp.description.length < 100
    );
    
    if (shortDescriptions.length > 0) {
      tips.experience.push({
        priority: 'medium',
        title: 'Expand Job Descriptions',
        description: `${shortDescriptions.length} job(s) have brief descriptions`,
        action: 'Write 2-4 bullet points per role focusing on achievements and impact, not just duties'
      });
    }
  }

  // ATS Optimization tips
  const commonATSKeywords = [
    'project management', 'data analysis', 'problem solving', 'team collaboration',
    'communication', 'leadership', 'customer service', 'process improvement'
  ];
  
  const resumeText = JSON.stringify(parsedData).toLowerCase();
  const missingATSKeywords = commonATSKeywords.filter(keyword => 
    !resumeText.includes(keyword.toLowerCase())
  );

  if (missingATSKeywords.length > 3) {
    tips.ats.push({
      priority: 'high',
      title: 'Add ATS-Friendly Keywords',
      description: 'Your resume may be missing common ATS keywords',
      action: `Consider incorporating: ${missingATSKeywords.slice(0, 4).join(', ')}`
    });
  }

  tips.ats.push({
    priority: 'medium',
    title: 'Use Standard Section Headers',
    description: 'Ensure you use conventional section names for ATS parsing',
    action: 'Use headers like "Professional Experience", "Education", "Skills", "Summary"'
  });

  tips.ats.push({
    priority: 'medium',
    title: 'Include Industry Keywords',
    description: 'Match keywords from job descriptions you\'re targeting',
    action: 'Review 3-5 target job postings and incorporate their key terms naturally'
  });

  // Formatting tips
  if (!contact.email || !contact.phone) {
    tips.formatting.push({
      priority: 'high',
      title: 'Complete Contact Information',
      description: 'Missing essential contact details',
      action: 'Ensure your resume includes email, phone, and LinkedIn profile'
    });
  }

  tips.formatting.push({
    priority: 'medium',
    title: 'Consistent Formatting',
    description: 'Maintain consistent font, spacing, and bullet styles',
    action: 'Use the same date format, bullet style, and font throughout your resume'
  });

  tips.formatting.push({
    priority: 'low',
    title: 'Professional Summary',
    description: 'Consider adding a brief professional summary at the top',
    action: 'Write 2-3 lines highlighting your key qualifications and career objectives'
  });

  // Content tips
  if (education.length === 0) {
    tips.content.push({
      priority: 'medium',
      title: 'Add Education Section',
      description: 'No education information detected',
      action: 'Include your highest degree, relevant coursework, or certifications'
    });
  }

  tips.content.push({
    priority: 'medium',
    title: 'Use Action Verbs',
    description: 'Start bullet points with strong action verbs',
    action: 'Use words like "Developed", "Implemented", "Optimized", "Led", "Achieved"'
  });

  tips.content.push({
    priority: 'low',
    title: 'Tailor for Each Application',
    description: 'Customize your resume for each job application',
    action: 'Adjust keywords and emphasize relevant experience for each specific role'
  });

  // Remove empty categories and sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  Object.keys(tips).forEach(category => {
    if (tips[category].length === 0) {
      delete tips[category];
    } else {
      tips[category].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }
  });

  return tips;
}

module.exports = router;
