const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String },
  uploadDate: { type: Date, default: Date.now },
  // later: parsedData, skillGaps, etc.

  parsedData: {
    fullText: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: [{
      degree: { type: String },
      institution: { type: String },
      years: { type: [Number], default: [] },
      raw: { type: String }
    }],
    experience: [{
      title: { type: String },
      company: { type: String },
      years: { type: [Number], default: [] },
      duration: { type: Number, default: 0 },
      raw: { type: String }
    }],
    contact: {
      email: { type: String },
      phone: { type: String },
      linkedin: { type: String },
      github: { type: String }
    },
    metadata: {
      pages: { type: Number },
      extractedAt: { type: Date },
      parser: { type: String, default: 'custom-pdf-parse' }
    }
  }

});

module.exports = mongoose.model('Resume', ResumeSchema);
