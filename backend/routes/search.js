const express = require('express');
const axios = require('axios');
const Search = require('../models/Search');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/search
// @desc    Generate study material from n8n (3 difficulty levels)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    console.log('🔹 Calling n8n webhook for topic:', topic);

    // 🔹 Call n8n webhook with retry logic
    let n8nResponse;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        console.log(`🔹 Attempt ${attempts + 1}/${maxAttempts} - Calling n8n webhook for topic: ${topic}`);
        const response = await axios.post(
          process.env.N8N_WEBHOOK_URL,
          { topic },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 600000, // 10 minute timeout for AI processing
          }
        );
        n8nResponse = response.data;
        break; // Success, exit retry loop
      } catch (err) {
        attempts++;
        console.error(`❌ Attempt ${attempts}/${maxAttempts} failed:`, err.message);

        if (attempts >= maxAttempts) {
          throw err; // Re-throw after all attempts failed
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, attempts) * 1000; // 1s, 2s, 4s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    console.log('🔹 Raw n8n response type:', typeof n8nResponse);
    console.log('🔹 Is array:', Array.isArray(n8nResponse));
    if (Array.isArray(n8nResponse)) {
      console.log('🔹 Array length:', n8nResponse.length);
      console.log('🔹 First item keys:', n8nResponse[0] ? Object.keys(n8nResponse[0]) : 'empty');
    }

    // 🔹 Parse n8n response - handle all possible formats
    let parsedData = null;

    // CASE 1: Array response (most common from n8n)
    if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
      const firstItem = n8nResponse[0];
      console.log('📦 Processing array response...');
      
      // Sub-case: Has 'output' field that's a string (needs parsing)
      if (firstItem.output && typeof firstItem.output === 'string') {
        console.log('🔸 Found string output field, parsing JSON...');
        let cleanOutput;
        try {
          cleanOutput = firstItem.output.trim();

          // Remove trailing commas before closing braces/brackets
          cleanOutput = cleanOutput.replace(/,(\s*[}\]])/g, '$1');

          // Handle incomplete JSON by finding the last complete object/array
          const openBraces = (cleanOutput.match(/\{/g) || []).length;
          const closeBraces = (cleanOutput.match(/\}/g) || []).length;
          const openBrackets = (cleanOutput.match(/\[/g) || []).length;
          const closeBrackets = (cleanOutput.match(/\]/g) || []).length;

          // If braces/brackets are unbalanced, try to complete the JSON
          if (openBraces > closeBraces) {
            // Add missing closing braces
            cleanOutput += '}'.repeat(openBraces - closeBraces);
          }
          if (openBrackets > closeBrackets) {
            // Add missing closing brackets
            cleanOutput += ']'.repeat(openBrackets - closeBrackets);
          }

          // If still incomplete, find the last complete closing brace and truncate
          if (!cleanOutput.endsWith('}') && !cleanOutput.endsWith(']')) {
            const lastBraceIndex = cleanOutput.lastIndexOf('}');
            const lastBracketIndex = cleanOutput.lastIndexOf(']');
            const lastIndex = Math.max(lastBraceIndex, lastBracketIndex);
            if (lastIndex > 0) {
              cleanOutput = cleanOutput.substring(0, lastIndex + 1);
            }
          }

          parsedData = JSON.parse(cleanOutput);
          console.log('✅ Successfully parsed output string');
        } catch (parseError) {
          console.error('❌ Failed to parse output string:', parseError.message);
          console.error('❌ Raw output preview:', firstItem.output.substring(0, 200) + '...');
          if (cleanOutput) {
            console.error('❌ Cleaned output preview:', cleanOutput.substring(0, 200) + '...');
          }
          throw new Error('Invalid JSON in output field');
        }
      }
      // Sub-case: Has 'output' field that's already an object
      else if (firstItem.output && typeof firstItem.output === 'object') {
        console.log('🔸 Found object output field');
        parsedData = firstItem.output;
      }
      // Sub-case: Has 'json' field (some n8n nodes use this)
      else if (firstItem.json) {
        console.log('🔸 Found json field');
        parsedData = firstItem.json;
      }
      // Sub-case: The item itself is the data
      else {
        console.log('🔸 Using first item directly');
        parsedData = firstItem;
      }
    }
    // CASE 2: Direct object response
    else if (typeof n8nResponse === 'object' && !Array.isArray(n8nResponse)) {
      console.log('📦 Processing direct object response...');

      // Sub-case: Has 'output' field that's a string (needs parsing)
      if (n8nResponse.output && typeof n8nResponse.output === 'string') {
        console.log('🔸 Found string output field, parsing JSON...');
        let cleanOutput;
        try {
          // Clean the string first - remove any trailing commas or malformed JSON
          cleanOutput = n8nResponse.output.trim();

          // Remove trailing commas before closing braces/brackets
          cleanOutput = cleanOutput.replace(/,(\s*[}\]])/g, '$1');

          // Handle incomplete JSON by finding the last complete object/array
          const openBraces = (cleanOutput.match(/\{/g) || []).length;
          const closeBraces = (cleanOutput.match(/\}/g) || []).length;
          const openBrackets = (cleanOutput.match(/\[/g) || []).length;
          const closeBrackets = (cleanOutput.match(/\]/g) || []).length;

          // If braces/brackets are unbalanced, try to complete the JSON
          if (openBraces > closeBraces) {
            // Add missing closing braces
            cleanOutput += '}'.repeat(openBraces - closeBraces);
          }
          if (openBrackets > closeBrackets) {
            // Add missing closing brackets
            cleanOutput += ']'.repeat(openBrackets - closeBrackets);
          }

          // If still incomplete, find the last complete closing brace and truncate
          if (!cleanOutput.endsWith('}') && !cleanOutput.endsWith(']')) {
            const lastBraceIndex = cleanOutput.lastIndexOf('}');
            const lastBracketIndex = cleanOutput.lastIndexOf(']');
            const lastIndex = Math.max(lastBraceIndex, lastBracketIndex);
            if (lastIndex > 0) {
              cleanOutput = cleanOutput.substring(0, lastIndex + 1);
            }
          }

          parsedData = JSON.parse(cleanOutput);
          console.log('✅ Successfully parsed output string');
        } catch (parseError) {
          console.error('❌ Failed to parse output string:', parseError.message);
          console.error('❌ Raw output preview:', n8nResponse.output.substring(0, 200) + '...');
          if (cleanOutput) {
            console.error('❌ Cleaned output preview:', cleanOutput.substring(0, 200) + '...');
          }
          throw new Error('Invalid JSON in output field');
        }
      }
      // Sub-case: Has 'output' field that's already an object
      else if (n8nResponse.output && typeof n8nResponse.output === 'object') {
        console.log('🔸 Found object output field');
        parsedData = n8nResponse.output;
      }
      // Sub-case: Has 'data' wrapper
      else if (n8nResponse.data && typeof n8nResponse.data === 'object') {
        console.log('🔸 Found data wrapper');
        parsedData = n8nResponse.data;
      }
      // Sub-case: Direct data
      else {
        console.log('🔸 Using response directly');
        parsedData = n8nResponse;
      }
    }
    // CASE 3: String response (needs parsing)
    else if (typeof n8nResponse === 'string') {
      console.log('📦 Processing string response...');
      try {
        parsedData = JSON.parse(n8nResponse);
        console.log('✅ Successfully parsed string response');
      } catch (parseError) {
        console.error('❌ Failed to parse string response:', parseError.message);
        throw new Error('Invalid JSON string from n8n');
      }
    }
    // CASE 4: Unknown format
    else {
      console.error('❌ Unexpected response format:', typeof n8nResponse);
      throw new Error('Unexpected response format from n8n');
    }

    // 🔹 Validate and normalize the structure
    console.log('🔍 Validating data structure...');
    console.log('🔍 Parsed data keys:', parsedData ? Object.keys(parsedData) : 'null');

    if (!parsedData) {
      throw new Error('Failed to parse n8n response');
    }

    // Check if data has the expected 'levels' structure
    let finalData = {};

    if (parsedData.levels) {
      // Perfect! Data already has levels
      console.log('✅ Data has levels structure');
      finalData = parsedData;
    } 
    else if (parsedData.beginner || parsedData.medium || parsedData.advanced) {
      // Data has level keys but no wrapper - add it
      console.log('🔧 Wrapping level data...');
      finalData = {
        topic: topic,
        levels: {
          beginner: parsedData.beginner || {},
          medium: parsedData.medium || {},
          advanced: parsedData.advanced || {}
        }
      };
    }
    else {
      console.error('❌ Invalid data structure. Keys found:', Object.keys(parsedData));
      throw new Error('Response missing required levels structure');
    }

    // Ensure topic field exists
    if (!finalData.topic) {
      finalData.topic = topic;
    }

    // Validate each level has required arrays
    const levels = ['beginner', 'medium', 'advanced'];
    levels.forEach(level => {
      if (!finalData.levels[level]) {
        console.warn(`⚠️ Missing ${level} level, creating empty structure`);
        finalData.levels[level] = {};
      }
      
      const levelData = finalData.levels[level];
      
      // Ensure all required arrays exist
      if (!levelData.modules) levelData.modules = [];
      if (!levelData.quiz) levelData.quiz = [];
      if (!levelData.coding_problems) levelData.coding_problems = [];
      if (!levelData.youtube_videos) levelData.youtube_videos = [];
      
      console.log(`📊 ${level}: ${levelData.modules.length} modules, ${levelData.quiz.length} quiz, ${levelData.coding_problems.length} problems, ${levelData.youtube_videos.length} videos`);
    });

    // 🔹 Save to MongoDB
    const search = new Search({
      userId: req.user.id,
      topic: topic,
      responseData: finalData,
    });

    await search.save();

    console.log('✅ Search saved to DB with ID:', search._id);

    // 🔹 Respond with full structured data
    res.json({
      success: true,
      searchId: search._id,
      topic: topic,
      data: finalData
    });

  } catch (err) {
    console.error('❌ Error in search route:', err.message);
    console.error('❌ Stack trace:', err.stack);

    // Handle axios timeout errors specifically
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: 'Request timed out. The AI processing is taking longer than expected. Please try again.',
        error: 'TIMEOUT'
      });
    }

    // Handle 404 errors (webhook not found)
    if (err.response && err.response.status === 404) {
      return res.status(500).json({
        success: false,
        message: 'Webhook endpoint not found. Please check your n8n configuration.',
        error: 'WEBHOOK_NOT_FOUND'
      });
    }

    // Handle 524 errors (timeout from n8n) - but n8n might still be processing
    if (err.response && err.response.status === 524) {
      console.log('⚠️ n8n returned 524 (timeout), but workflow might still be running. Checking if we should wait...');

      // For 524 errors, we might want to implement a polling mechanism
      // or just inform the user that the process is taking longer
      return res.status(202).json({
        success: false,
        message: 'Your request is being processed. The AI generation is taking longer than expected. Please check your topics in a few minutes.',
        error: 'PROCESSING',
        checkLater: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET /api/search
// @desc    Fetch previous searches
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const searches = await Search.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('topic createdAt responseData.topic')
      .lean();

    // Format response for list view
    const formattedSearches = searches.map(search => ({
      _id: search._id,
      topic: search.topic,
      createdAt: search.createdAt
    }));

    res.json({
      success: true,
      searches: formattedSearches
    });
  } catch (err) {
    console.error('Error fetching searches:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   GET /api/search/:id
// @desc    Get a specific search by ID with full data
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const search = await Search.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!search) {
      return res.status(404).json({ 
        success: false,
        message: 'Search not found' 
      });
    }

    // Return full   data structure
    res.json({
      success: true,
      searchId: search._id,
      topic: search.topic,
      data: search.responseData,
      createdAt: search.createdAt
    });
  } catch (err) {
    console.error('Error fetching search:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   DELETE /api/search/:id
// @desc    Delete a specific search and its progress
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const search = await Search.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!search) {
      return res.status(404).json({ 
        success: false,
        message: 'Search not found' 
      });
    }

    // Also delete associated progress
    const Progress = require('../models/Progress');
    await Progress.deleteMany({ searchId: req.params.id });

    console.log('✅ Deleted search and progress for:', req.params.id);

    res.json({ 
      success: true,
      message: 'Search and associated progress deleted'
    });
  } catch (err) {
    console.error('Error deleting search:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;