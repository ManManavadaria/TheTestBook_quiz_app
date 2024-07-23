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
    forClasses: [{
      type: String,
      required: true,
    }],
    questions: [questionSchema],
  });
  
  
  module.exports = Test;
  