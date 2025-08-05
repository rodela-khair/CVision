const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String },
  uploadDate: { type: Date, default: Date.now },
  // later: parsedData, skillGaps, etc.

  parsedData: {
  fullText:  { type: String, default: '' },
  skills:    { type: [String], default: [] },
  education: { type: [String], default: [] },
  experience:{ type: [String], default: [] }
  }

});

module.exports = mongoose.model('Resume', ResumeSchema);
