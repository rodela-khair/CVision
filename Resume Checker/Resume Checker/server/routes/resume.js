// server/routes/resume.js
const express = require('express');
const router  = express.Router();
const path    = require('path');
const multer  = require('multer');

const auth             = require('../middleware/auth');
const { uploadResume, getParsedResume, getUserResumes, deleteResume } = require('../controllers/resumeController');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post(
  '/upload',
  auth,
  upload.single('resume'),
  uploadResume
);

// Get all resumes for the authenticated user
router.get(
  '/user-resumes',
  auth,
  getUserResumes
);

// Delete a specific resume
router.delete(
  '/:id',
  auth,
  deleteResume
);

// Test route to verify routing is working
router.get('/test', (req, res) => {
  res.json({ message: 'Resume routes are working', timestamp: new Date() });
});

router.get(
  '/:id/parsed',
  auth,
  getParsedResume
);

module.exports = router;
