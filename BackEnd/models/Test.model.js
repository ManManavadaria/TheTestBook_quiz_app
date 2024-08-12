const mongoose = require('mongoose');

// Helper function for array validation
function arrayLimit(val) {
  return val.length === 4;
}

// Define question schema
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: arrayLimit,
      message: 'options must have 4 options',
    },
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
  },
});

// Define test schema
const testSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true,
  },
  testName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  totalTimeLimit: {
    type: Number,
    required: true,
  },
  isDummy: { type: Boolean, default: false },
  questions: [questionSchema],
}, { timestamps: true });

// Create Test model
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
