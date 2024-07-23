const mongoose = require('mongoose');

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

  const Question = mongoose.model('Question', questionSchema);

  module.exports = Question;
  