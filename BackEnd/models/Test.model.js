const mongoose = require('mongoose');

// Test.model.js
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have 4 options'],
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
  
  function arrayLimit(val) {
    return val.length === 4;
  }
  
  const testSchema = new mongoose.Schema({
    _id: { type: String, required: true },
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
    questions: [questionSchema],
  },{ timestamps: true });

  const Test = mongoose.model('Test',testSchema)
  
  module.exports = Test;
  