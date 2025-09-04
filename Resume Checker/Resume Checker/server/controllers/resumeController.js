// server/controllers/resumeController.js
require('dotenv').config();
const Resume   = require('../models/Resume');
const fs       = require('fs');
const path     = require('path');
const customParser = require('../services/customResumeParser');
const AnalyticsService = require('../services/AnalyticsService');

exports.uploadResume = async (req, res) => {
  try {
    console.log('⚙️ uploadResume called, file =', req.file);
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    // Check if user already has a resume
    const existingResume = await Resume.findOne({ user: req.user.id });
    if (existingResume) {
      // Delete the uploaded file since we won't use it
      const fs = require('fs');
      const uploadedFilePath = path.join(__dirname, '../uploads', req.file.filename);
      try {
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } catch (err) {
        console.warn('Could not delete uploaded file:', err.message);
      }
      
      return res.status(400).json({ 
        msg: 'You already have a resume uploaded. Please delete your existing resume first.' 
      });
    }

    // 1) Create base record
    const newResume = new Resume({
      user:        req.user.id,
      filename:    req.file.filename,
      originalName:req.file.originalname,
    });
    await newResume.save();
    console.log('✅ Saved base Resume record:', newResume._id);

    // 2) Parse with custom parser
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ msg: 'Uploaded file missing on server.' });
    }

    console.log('🚀 Parsing file with custom parser...');
    const parsedData = await customParser.parseResume(filePath);
    
    console.log('📥 Custom parser extracted skills count:', parsedData.skills.length);

    // 3) Save parsed data
    newResume.parsedData = parsedData;
    await newResume.save();
    console.log('✅ Saved parsedData for resume', newResume._id);

    // Log analytics event
    await AnalyticsService.logEvent('resume_upload', {
      userId: req.user.id,
      resumeId: newResume._id,
      metadata: {
        filename: req.file.originalname,
        skillsCount: parsedData.skills.length,
        skills: parsedData.skills.slice(0, 10), // Log first 10 skills
        parser: 'custom-pdf-parse'
      }
    });

    return res.json({
      msg: 'Resume uploaded & parsed successfully',
      resume: newResume,
      fileName: req.file.filename
    });
  } catch (err) {
    console.error('❌ uploadResume error:', err.message);
    return res.status(500).json({
      msg: 'Server error: ' + err.message
    });
  }
};

exports.getParsedResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    return res.json({ parsedData: resume.parsedData });
  } catch (err) {
    console.error('❌ getParsedResume error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get all resumes for the authenticated user
exports.getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('_id filename originalName parsedData uploadDate')
      .sort({ uploadDate: -1 });

    // Format the response to include useful info for the frontend
    const formattedResumes = resumes.map(resume => ({
      _id: resume._id,
      fileName: resume.originalName || resume.filename,
      uploadDate: resume.uploadDate,
      skillsCount: resume.parsedData?.skills?.length || 0,
      skills: resume.parsedData?.skills || [],
      // For skill gap analysis, we'll use parsedData.skills as extractedSkills
      extractedSkills: resume.parsedData?.skills || []
    }));

    return res.json(formattedResumes);
  } catch (err) {
    console.error('❌ getUserResumes error:', err);
    return res.status(500).json({ 
      msg: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// Delete a resume
exports.deleteResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    // Find the resume and verify ownership
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    
    if (!resume) {
      return res.status(404).json({ 
        msg: 'Resume not found or you do not have permission to delete it' 
      });
    }

    // Delete the file from filesystem if it exists
    const fs = require('fs');
    const path = require('path');
    
    if (resume.filename) {
      const filePath = path.join(__dirname, '../uploads', resume.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ File deleted:', resume.filename);
        }
      } catch (fileErr) {
        console.warn('⚠️ Could not delete file:', resume.filename, fileErr.message);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await Resume.findByIdAndDelete(resumeId);
    
    console.log('✅ Resume deleted:', resumeId);
    return res.json({ 
      success: true,
      msg: 'Resume deleted successfully' 
    });

  } catch (err) {
    console.error('❌ deleteResume error:', err);
    return res.status(500).json({ 
      msg: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};
