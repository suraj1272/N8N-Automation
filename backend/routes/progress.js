const express = require('express');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/progress/:searchId
// @desc    Get progress for a specific search
// @access  Private
router.get('/:searchId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user.id,
      searchId: req.params.searchId,
    });

    if (!progress) {
      return res.json({ progress: {} });
    }

    // Convert Map to plain object for JSON response
    const progressObj = {};
    if (progress.progress) {
      progress.progress.forEach((value, key) => {
        progressObj[key] = value;
      });
    }

    res.json({ progress: progressObj });
  } catch (err) {
    console.error('Error fetching progress:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/progress
// @desc    Update progress for a search
// @access  Private
router.post('/', auth, async (req, res) => {
  const { searchId, progress: newProgress } = req.body;

  if (!searchId || !newProgress) {
    return res.status(400).json({ message: 'searchId and progress are required' });
  }

  try {
    let progress = await Progress.findOne({
      userId: req.user.id,
      searchId,
    });

    if (!progress) {
      // Create new progress record
      progress = new Progress({
        userId: req.user.id,
        searchId,
        progress: new Map(Object.entries(newProgress)),
      });
    } else {
      // Update existing progress
      progress.progress = new Map(Object.entries(newProgress));
      progress.updatedAt = Date.now();
    }

    await progress.save();
    res.json({ message: 'Progress updated', success: true });
  } catch (err) {
    console.error('Error updating progress:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/progress/:searchId
// @desc    Delete progress for a specific search
// @access  Private
router.delete('/:searchId', auth, async (req, res) => {
  try {
    await Progress.findOneAndDelete({
      userId: req.user.id,
      searchId: req.params.searchId,
    });

    res.json({ message: 'Progress deleted', success: true });
  } catch (err) {
    console.error('Error deleting progress:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;