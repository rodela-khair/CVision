// server/routes/resume.js
const express = require('express');
const router  = express.Router();
const path    = require('path');
const multer  = require('multer');

const auth             = require('../middleware/auth');
const { uploadResume, getParsedResume } = require('../controllers/resumeController');

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

router.get(
  '/:id/parsed',
  auth,
  getParsedResume
);

module.exports = router;
