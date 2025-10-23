const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  searchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Search', required: true },
  
  // Changed: Now stores progress for all levels as a flexible object
  progress: { 
    type: Map, 
    of: [Number],
    default: {} 
  },
  // Example structure:
  // {
  //   "beginner_module": [0, 1, 2],
  //   "beginner_quiz": [0, 1],
  //   "medium_module": [0],
  //   "medium_quiz": [],
  //   "advanced_module": [],
  //   "advanced_quiz": []
  // }
  
  updatedAt: { type: Date, default: Date.now },
});

// Ensure unique progress per user and search
progressSchema.index({ userId: 1, searchId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);