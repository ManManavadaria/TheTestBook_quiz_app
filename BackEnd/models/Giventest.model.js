const mongoose = require('mongoose');
// / GivenTest.model.js
const givenAnswerSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  givenAnswer: {
    type: String,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const givenTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  answers: [givenAnswerSchema],
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'abandoned'],
    required: true,
  },
  totalTimeTaken: {
    type: Number,
    required: true,
  }
},{ timestamps: true });
  
  const GivenTest = mongoose.model('GivenTest', givenTestSchema);
  
  module.exports = GivenTest;
  