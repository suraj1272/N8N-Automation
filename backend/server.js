const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  // 1. FIXED: Your frontend is Vite, so it runs on port 5173, not 3000
  origin: [
    'http://localhost:5173', 
    'https://n8-n-automation-frontend.vercel.app', 
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// ✅ Simple public endpoint
// This will now be at /api/
app.get('/', (req, res) => {
  res.send('✅ Backend is running successfully!');
});

// Routes
// 2. FIXED: Removed /api prefix because vercel.json already adds it
// (This stops /api/api/auth)
app.use('/auth', require('./routes/auth'));
app.use('/search', require('./routes/search'));
app.use('/progress', require('./routes/progress'));

// 3. FIXED: Replaced app.listen() with module.exports
// Vercel is serverless and needs this to run your code
module.exports = app;