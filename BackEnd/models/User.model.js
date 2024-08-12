const mongoose = require('mongoose');
const Test = require('./Test.model');
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
  },{ timestamps: true });

  userSchema.pre('save', async function (next) {
    const user = this;
  
    // If the user is new and allowedTests is empty, add dummy test IDs
    if (user.isNew && user.allowedTests.length === 0) {
      // Find all dummy tests by the isDummy tag
      const dummyTests = await Test.find({ isDummy: true });
  
      // Extract the IDs of the dummy tests and add them to the allowedTests array
      const dummyTestIds = dummyTests.map(test => test._id);
      user.allowedTests.push(...dummyTestIds);
    }
  
    next();
  });
  

const User = mongoose.model('User', userSchema);

module.exports = User;
