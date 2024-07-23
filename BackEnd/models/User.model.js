const mongoose = require('mongoose');

// User.model.js
const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    class: {
      type: String,
      required: true
    },
    allowedTests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
    }],
    givenTests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GivenTest',
    }],
    accessLevel: {
      type: String,
      enum: ['super admin', 'admin', 'student'],
      required: true,
    },
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
