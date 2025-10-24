const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Correct port for Vite
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

// Routes
// We remove '/api' because vercel.json already handles it
app.use('/api/auth', require('./routes/auth'));
app.use('/search', require('./routes/search'));
app.use('/progress', require('./routes/progress'));

// Export the app for Vercel (THIS IS CRITICAL)
// DO NOT USE app.listen()
module.exports = app;