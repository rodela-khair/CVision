// server/controllers/resumeController.js
require('dotenv').config();
const Resume   = require('../models/Resume');
const fs       = require('fs');
const path     = require('path');
const axios    = require('axios');
const FormData = require('form-data');

exports.uploadResume = async (req, res) => {
  try {
    console.log('⚙️ uploadResume called, file =', req.file);
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    // 1) Create base record
    const newResume = new Resume({
      user:        req.user.id,
      filename:    req.file.filename,
      originalName:req.file.originalname,
    });
    await newResume.save();
    console.log('✅ Saved base Resume record:', newResume._id);

    // 2) Prepare file for Affinda
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ msg: 'Uploaded file missing on server.' });
    }
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    // 3) Send to Affinda
    console.log('🚀 Sending file to Affinda...');
    const affRes = await axios.post(
      'https://api.affinda.com/v2/resumes',
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.AFFINDA_API_KEY}`,
          ...form.getHeaders()
        }
      }
    );
    const parsed = affRes.data.data;
    console.log('📥 Affinda parsed skills count:', (parsed.skills || []).length);

    // 4) Normalize skills: strip parentheses and trim
    const skills = (parsed.skills || [])
      .map(s => s.name)
      .map(name =>
        name
          .replace(/\s*\(.*?\)/g, '') // remove any "(...)" and preceding space
          .trim()
      )
      .filter(Boolean);             // drop empty strings

    console.log('🔧 Normalized skills:', skills);

    // 5) Save parsedData (skills only)
    newResume.parsedData = {
      fullText:   parsed.text || '',
      skills,
      education:  [],  // still empty
      experience: []   // still empty
    };
    await newResume.save();
    console.log('✅ Saved parsedData for resume', newResume._id);

    return res.json({
      msg:    'Resume uploaded & parsed',
      resume: newResume
    });
  } catch (err) {
    console.error('❌ uploadResume error:', err.response?.data || err.message);
    return res.status(500).json({
      msg: 'Server error: ' + (err.response?.data?.message || err.message)
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
