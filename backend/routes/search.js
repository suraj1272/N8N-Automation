const express = require('express');
const axios = require('axios');
const Search = require('../models/Search'); // Ensure this model has a 'status' field (String, default: 'processing')
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/search
// @desc    Initiate study material generation via n8n (asynchronous)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, message: 'Topic is required' });
  }

  let searchRecord; // To store the created search record

  try {
    // 1. Save the initial search request with 'processing' status
    searchRecord = new Search({
      userId: req.user.id,
      topic: topic,
      status: 'processing', // Default status from your updated model
      // responseData will be added later by the callback
    });
    await searchRecord.save();
    console.log('✅ Initial search saved with ID:', searchRecord._id);

    // 2. Call n8n webhook asynchronously (n8n MUST be set to respond immediately)
    console.log('🔹 Calling n8n webhook for topic:', topic, 'with searchId:', searchRecord._id);

    // Make sure N8N_WEBHOOK_URL is set correctly in Vercel Environment Variables
    if (!process.env.N8N_WEBHOOK_URL) {
       console.error('❌ N8N_WEBHOOK_URL environment variable is not set!');
       throw new Error('N8N webhook URL is missing in server configuration.');
    }

    await axios.post(
      process.env.N8N_WEBHOOK_URL,
      {
        topic: topic,
        searchId: searchRecord._id // Pass the ID to n8n for the callback
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000, // Short timeout (15s) - n8n should respond almost instantly
      }
    );
    console.log('✅ n8n webhook triggered successfully.');

    // 3. Respond immediately to the frontend with 202 Accepted
    return res.status(202).json({
      success: true,
      message: "Processing started. Results will be available soon.",
      searchId: searchRecord._id,
      status: 'processing'
    });

  } catch (err) {
    console.error('❌ Error initiating search:', err.message);

    // If the record was created but the n8n call failed, update status to 'failed'
    if (searchRecord && searchRecord._id) {
      try {
        await Search.findByIdAndUpdate(searchRecord._id, { status: 'failed' });
        console.log(`⚠️ Marked search ${searchRecord._id} as failed.`);
      } catch (updateError) {
        console.error('❌ Failed to update search status to failed:', updateError.message);
      }
    }

    // Handle specific errors from the initial webhook call
    if (err.response && err.response.status === 404) {
      return res.status(500).json({
        success: false,
        message: 'Webhook endpoint not found. Please check configuration.',
        error: 'WEBHOOK_NOT_FOUND'
      });
    }
    // Handle timeouts *from the initial call only* (n8n didn't respond quickly)
    if (err.code === 'ECONNABORTED' || (err.response && err.response.status === 504)) {
      return res.status(504).json({
        success: false,
        message: 'Webhook did not respond quickly to the initial trigger. Please try again.',
        error: 'INITIAL_TIMEOUT'
      });
    }

    // Generic error for other issues during initiation
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate content generation',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET /api/search
// @desc    Fetch previous searches (includes status)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Only fetch searches belonging to the logged-in user
    const searches = await Search.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50) // Limit the number of results for performance
      .select('topic createdAt status responseData') // Include responseData for progress calculation
      .lean(); // Use lean() for faster read-only queries

    // Format the response data
    const formattedSearches = searches.map(search => ({
      _id: search._id,
      topic: search.topic,
      createdAt: search.createdAt,
      status: search.status || 'unknown', // Add status, provide default if missing
      responseData: search.responseData // Include responseData for dashboard progress calculation
    }));

    res.json({
      success: true,
      searches: formattedSearches
    });
  } catch (err) {
    console.error('Error fetching searches:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching searches',
      error: err.message
    });
  }
});

// @route   GET /api/search/:id
// @desc    Get a specific search by ID with full data (checks status)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Find the search by ID *and* ensure it belongs to the logged-in user
    const search = await Search.findOne({
      _id: req.params.id,
      userId: req.user.id, // Security check: User can only access their own searches
    }).lean();

    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search not found or you do not have permission to view it'
      });
    }

    // --- Handle different statuses ---
    if (search.status === 'processing') {
      // Respond with 202 Accepted, indicating it's still working
      return res.status(202).json({
          success: true, // Still success, just not ready
          status: 'processing',
          message: 'Content generation is still in progress. Please check back later.',
          searchId: search._id,
          topic: search.topic,
          createdAt: search.createdAt
          // No 'data' field yet
      });
    } else if (search.status === 'failed') {
       // Respond with a server error status if generation failed
      return res.status(500).json({ // Use 500 status for failed generation state
          success: false,
          status: 'failed',
          message: 'Content generation failed for this topic. You may need to delete it and try again.',
          searchId: search._id,
          topic: search.topic,
          createdAt: search.createdAt
          // No 'data' field
      });
    } else if (search.status === 'completed' && search.responseData) {
      // If completed and data exists, send the full data
       res.json({
         success: true,
         status: 'completed',
         searchId: search._id,
         topic: search.topic,
         data: search.responseData, // Send the actual AI results
         createdAt: search.createdAt
       });
    } else {
       // Catch-all for unexpected status or missing data when supposedly completed
       console.error(`Search ${search._id} has unexpected status (${search.status}) or missing data when status is completed.`);
       return res.status(500).json({
          success: false,
          status: search.status || 'error',
          message: 'Search record is in an unexpected state (e.g., completed but missing data). Please contact support.',
          searchId: search._id,
          topic: search.topic,
          createdAt: search.createdAt
       });
    }

  } catch (err) {
    console.error('Error fetching specific search:', err.message);
     // Handle invalid MongoDB ID format errors
     if (err.name === 'CastError') {
       return res.status(400).json({
         success: false,
         message: 'Invalid Search ID format',
         error: err.message
       });
     }
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error fetching search details',
      error: err.message
    });
  }
});


// @route   DELETE /api/search/:id
// @desc    Delete a specific search and its progress
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find and delete the search record, ensuring it belongs to the logged-in user
    const search = await Search.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // Security check
    });

    // If no search was found (or user didn't own it)
    if (!search) {
      return res.status(404).json({
        success: false,
        message: 'Search not found or you do not have permission to delete it'
      });
    }

    // Attempt to delete associated progress records (if Progress model exists)
    try {
        const Progress = require('../models/Progress'); // Make sure this model exists
        // Add userId here too for security/scoping
        const deleteResult = await Progress.deleteMany({ searchId: req.params.id, userId: req.user.id });
        console.log(`✅ Deleted ${deleteResult.deletedCount} progress records for search: ${req.params.id}`);
    } catch (progressError) {
        // Log error but don't fail the whole delete if progress model doesn't exist or deletion fails
        console.warn('⚠️ Could not delete progress records (this might be normal if none existed):', progressError.message);
    }

    console.log('✅ Successfully deleted search record:', req.params.id);

    // Send success response
    res.json({
      success: true,
      message: 'Search and associated progress deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting search:', err.message);
     // Handle invalid MongoDB ID format errors
     if (err.name === 'CastError') {
       return res.status(400).json({
         success: false,
         message: 'Invalid Search ID format',
         error: err.message
       });
     }
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error during deletion',
      error: err.message
    });
  }
});

// Export the router for use in server.js
module.exports = router;