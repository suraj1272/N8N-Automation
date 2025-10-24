const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import your route files
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search'); // This handles initiating search, GETs, DELETEs
const progressRoutes = require('./routes/progress');
const Search = require('./models/Search'); // Import Search model specifically for the callback route

dotenv.config();

const app = express();

// --- Middleware ---

// CORS Configuration - Allows your frontend to call the API
app.use(cors({
  origin: [
    'http://localhost:5173', // Your local Vite frontend
    'https://n8-n-automation-frontend.vercel.app', // Your deployed frontend URL
    process.env.FRONTEND_URL // Optional additional URL from env variables
  ].filter(Boolean), // Removes undefined/empty values from the array
  credentials: true // Allows cookies/authorization headers
}));

// Body Parser - Needed to read JSON data from requests (like login, signup, and the n8n callback)
app.use(express.json());

// --- MongoDB Connection ---
// Use console.error for database connection errors
mongoose.connect(process.env.MONGO_URI, {
  // These options are deprecated but often included for older tutorials
   //useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err.message)); // Log only the error message

// --- API Routes ---

// Mount your existing route handlers
// Vercel routes '/api/auth/...' to './routes/auth.js' via this line
app.use('/api/auth', authRoutes);

// Vercel routes '/api/search/...' to './routes/search.js' via this line
// This handles POST /api/search, GET /api/search, GET /api/search/:id, DELETE /api/search/:id
app.use('/api/search', searchRoutes);

// Vercel routes '/api/progress/...' to './routes/progress.js' via this line
app.use('/api/progress', progressRoutes);


// --- Callback Endpoint for n8n ---
// This is the new route n8n will call when the AI processing is finished
app.post('/api/search/callback', async (req, res) => {
  console.log('✅ Received callback from n8n. Body:', req.body);

  try {
    const { searchId, results } = req.body;

    // --- Basic Validation ---
    if (!searchId || !results) {
      console.error('❌ Callback Error: Missing searchId or results in the request body.');
      return res.status(400).json({ success: false, message: 'Missing searchId or results in callback data' });
    }

    // --- <<< NEW: More tolerant handling for various n8n 'results' shapes >>> ---
    // finalResultsObject will hold the parsed object (when possible)
    let finalResultsObject = null;

    // helper: try several parsing strategies for a string that should contain JSON
    const tryParseJsonString = (s) => {
      if (!s || typeof s !== 'string') return null;
      // First, a direct parse
      try {
        return JSON.parse(s);
      } catch (e) {
        // Next, try to extract the JSON substring between first '{' and last '}'
        const first = s.indexOf('{');
        const last = s.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          const candidate = s.slice(first, last + 1);
          try {
            return JSON.parse(candidate);
          } catch (e2) {
            // fallthrough
          }
        }
        // Try unescaping common escaped quotes
        try {
          const unescaped = s.replace(/\\"/g, '"');
          return JSON.parse(unescaped);
        } catch (e3) {
          // give up
        }
      }
      return null;
    };

    // Accept several shapes:
    // 1) results is a string containing JSON
    // 2) results is an object with an 'output' string that contains JSON
    // 3) results is already an object with the expected structure (levels)
    if (typeof results === 'string') {
      console.log('🔸 Callback: results is a string — attempting to parse JSON...');
      finalResultsObject = tryParseJsonString(results);
    } else if (typeof results === 'object' && results !== null && typeof results.output === 'string') {
      console.log('🔸 Callback: results.output is a string — attempting to parse JSON...');
      finalResultsObject = tryParseJsonString(results.output);
      if (!finalResultsObject) {
        console.warn(`⚠️ Parsing attempts failed for results.output (searchId: ${searchId}). Saving raw output for inspection.`);
        console.error('Raw output preview:', results.output.substring(0, 1000));
      }
    } else if (typeof results === 'object' && results !== null && results.levels) {
      console.log('🔸 Callback: Received results object directly with "levels" property.');
      finalResultsObject = results;
    } else {
      console.error(`❌ Callback Error for ${searchId}: Received results object has unexpected structure. Type: ${typeof results}. Keys:`, (results && typeof results === 'object') ? Object.keys(results) : 'N/A');
      await Search.findByIdAndUpdate(searchId, { status: 'failed', responseData: { error: 'Unexpected results structure received from n8n callback', rawResults: results } });
      return res.status(400).json({ success: false, message: 'Unexpected results structure received in callback' });
    }

    // If parsing hasn't yielded a usable object, return a helpful error and store raw data
    if (!finalResultsObject) {
      console.error(`❌ Callback Error for ${searchId}: Could not parse results into a valid JSON object.`);
      // Save the raw payload for debugging in the DB (truncated)
      const rawPreview = (typeof results === 'string') ? results.slice(0, 2000) : (results && results.output ? String(results.output).slice(0,2000) : JSON.stringify(results).slice(0,2000));
      await Search.findByIdAndUpdate(searchId, { status: 'failed', responseData: { error: 'Could not parse results JSON from n8n callback', rawPreview } });
      return res.status(400).json({ success: false, message: 'Could not parse results JSON from callback', rawPreview });
    }
    // --- <<< END tolerant parsing logic >>> ---


    // --- Validate the PARSED results structure ---
     if (!finalResultsObject || typeof finalResultsObject !== 'object' || !finalResultsObject.levels) {
        console.error(`❌ Callback Error for ${searchId}: Parsed results object is invalid or missing 'levels'.`);
         await Search.findByIdAndUpdate(searchId, { status: 'failed', responseData: { error: "Parsed results structure is invalid" } });
         return res.status(400).json({ success: false, message: 'Parsed results structure is invalid' });
     }
    // --- End Validation ---


    // Find the original search record and update it
    const updatedSearch = await Search.findByIdAndUpdate(
      searchId,
      {
        responseData: finalResultsObject, // Save the PARSED object
        status: 'completed'
      },
      { new: true }
    );

    if (!updatedSearch) {
      console.error(`❌ Callback Error: Could not find Search record with ID: ${searchId}.`);
      return res.status(404).json({ success: false, message: 'Search record not found for the provided ID.' });
    }

    console.log(`✅ Callback Success: Successfully updated search record ${searchId} with status 'completed'.`);
    res.status(200).json({ success: true, message: 'Callback received and processed successfully' });

  } catch (error) {
    console.error('❌ Critical Error processing n8n callback:', error.message);
    console.error('Stack Trace:', error.stack);
     if (error.name === 'CastError') {
       return res.status(400).json({ success: false, message: 'Invalid Search ID format received in callback', error: error.message });
     }
    res.status(500).json({ success: false, message: 'Internal server error processing callback', error: error.message });
  }
});

// --- Vercel Export ---
// This line is essential for Vercel to run your Express app as a serverless function.
// It replaces the traditional app.listen(PORT, ...)

// For local development, start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
