const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Add index for faster queries
  },
  topic: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  responseData: { 
    type: Object, 
    required: true 
  },
  // Expected structure from n8n:
  // {
  //   "topic": "JavaScript",
  //   "levels": {
  //     "beginner": {
  //       "modules": [
  //         {
  //           "title": "Introduction to JavaScript",
  //           "content": "JavaScript is a high-level, interpreted programming language..."
  //         }
  //       ],
  //       "quiz": [
  //         {
  //           "question": "Which keyword is used to declare a constant variable in JavaScript?",
  //           "answer": "const"
  //         }
  //       ],
  //       "coding_problems": [
  //         {
  //           "problem": "Write a function called `reverseString` that takes a string...",
  //           "solution": "function reverseString(str) {\n  return str.split('').reverse().join('');\n}"
  //         }
  //       ],
  //       "youtube_videos": [
  //         "https://www.youtube.com/watch?v=W6NZfCO5SIk",
  //         "https://www.youtube.com/watch?v=hdI2bqOjy3c"
  //       ]
  //     },
  //     "medium": {
  //       "modules": [...],
  //       "quiz": [...],
  //       "coding_problems": [...],
  //       "youtube_videos": [...]
  //     },
  //     "advanced": {
  //       "modules": [...],
  //       "quiz": [...],
  //       "coding_problems": [...],
  //       "youtube_videos": [...]
  //     }
  //   }
  // }
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true // Add index for sorting
  },
});

// Compound index for efficient user-specific queries
searchSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Search', searchSchema);