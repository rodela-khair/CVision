// server/routes/jobs.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  getJobs, createJob, updateJob, deleteJob
} = require('../controllers/jobController');

// GET /api/jobs           ← anyone logged in
router.get('/', auth, getJobs);

// POST /api/jobs          ← admin only
router.post('/', auth, isAdmin, createJob);

// PUT /api/jobs/:id       ← admin only
router.put('/:id', auth, isAdmin, updateJob);

// DELETE /api/jobs/:id    ← admin only
router.delete('/:id', auth, isAdmin, deleteJob);

module.exports = router;
