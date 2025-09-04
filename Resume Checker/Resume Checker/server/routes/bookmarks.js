const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  bookmarkJob,
  removeBookmark,
  getBookmarkedJobs,
  toggleBookmark,
  isJobBookmarked
} = require('../controllers/bookmarkController');

// @route   POST /api/bookmarks/:jobId
// @desc    Bookmark a job
// @access  Private
router.post('/:jobId', auth, bookmarkJob);

// @route   DELETE /api/bookmarks/:jobId
// @desc    Remove bookmark
// @access  Private
router.delete('/:jobId', auth, removeBookmark);

// @route   PUT /api/bookmarks/:jobId/toggle
// @desc    Toggle bookmark (add if not bookmarked, remove if bookmarked)
// @access  Private
router.put('/:jobId/toggle', auth, toggleBookmark);

// @route   GET /api/bookmarks
// @desc    Get all bookmarked jobs for user
// @access  Private
router.get('/', auth, getBookmarkedJobs);

// @route   GET /api/bookmarks/:jobId/check
// @desc    Check if job is bookmarked by user
// @access  Private
router.get('/:jobId/check', auth, isJobBookmarked);

module.exports = router;
