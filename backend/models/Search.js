const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Good for faster queries
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  responseData: {
    type: Object,
    // Make this NOT required initially, as it's added later by the callback
    // required: true
  },
  // ADD THIS FIELD
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'], // Allowed values
    default: 'processing', // Default status when created
    index: true // Add index if you query by status often
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Good for sorting
  },
});

// Compound index for efficient user-specific queries sorted by date
searchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Search', searchSchema);