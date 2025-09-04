// server/routes/match.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { matchJobs } = require('../controllers/matchController');

// GET /api/match/:resumeId
router.get('/:resumeId', auth, matchJobs);

module.exports = router;
