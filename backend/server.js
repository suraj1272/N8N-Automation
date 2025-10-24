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
  console.log('✅ Received callback from n8n. Body:', req.body); // Log the data received from n8n

  try {
    // Extract the searchId and results data that n8n sends back
    const { searchId, results } = req.body;

    // --- Basic Validation ---
    if (!searchId || !results) {
      console.error('❌ Callback Error: Missing searchId or results in the request body.');
      return res.status(400).json({ success: false, message: 'Missing searchId or results in callback data' });
    }

    // Optional: Add more specific validation for the 'results' structure if needed
    if (typeof results !== 'object' || results === null || !results.levels) {
         console.error(`❌ Callback Error for ${searchId}: Received results are not a valid object with a 'levels' property.`);
         // Decide how to handle bad data: Update status to 'failed' or just log and ignore?
         // Let's try to update status to failed
          await Search.findByIdAndUpdate(searchId, { status: 'failed', responseData: { error: "Invalid results structure received from n8n callback" } });
         return res.status(400).json({ success: false, message: 'Invalid results structure received in callback' });
     }
    // --- End Validation ---


    // Find the original search record in MongoDB using the searchId
    const updatedSearch = await Search.findByIdAndUpdate(
      searchId,
      {
        responseData: results, // Save the AI-generated 'results' data into the 'responseData' field
        status: 'completed'   // Update the status field to 'completed'
      },
      { new: true } // Option to return the updated document (optional)
    );

    // Check if the search record was found and updated
    if (!updatedSearch) {
      console.error(`❌ Callback Error: Could not find Search record with ID: ${searchId}. Maybe it was deleted?`);
      // n8n might send a callback for a search the user already deleted
      return res.status(404).json({ success: false, message: 'Search record not found for the provided ID. It might have been deleted.' });
    }

    console.log(`✅ Callback Success: Successfully updated search record ${searchId} with status 'completed'.`);

    // Send a success response back to n8n to acknowledge receipt
    res.status(200).json({ success: true, message: 'Callback received and processed successfully' });

  } catch (error) {
    // Catch any unexpected errors during callback processing
    console.error('❌ Critical Error processing n8n callback:', error.message);
    console.error('Stack Trace:', error.stack); // Log stack trace for detailed debugging

     // Handle potential CastError if searchId format is wrong (though unlikely from n8n)
     if (error.name === 'CastError') {
       return res.status(400).json({ success: false, message: 'Invalid Search ID format received in callback', error: error.message });
     }

    // Send a generic server error response back to n8n
    res.status(500).json({ success: false, message: 'Internal server error processing callback', error: error.message });
  }
});


// --- Vercel Export ---
// This line is essential for Vercel to run your Express app as a serverless function.
// It replaces the traditional app.listen(PORT, ...)
module.exports = app;