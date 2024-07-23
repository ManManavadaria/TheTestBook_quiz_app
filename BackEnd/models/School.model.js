const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


// School.model.js
const schoolSchema = new mongoose.Schema({
    schoolId: {
        type: String,
        unique: true,
        default: uuidv4,
    },
    schoolName: {
      type: String,
      required: true,
    },
  });
  
  const School = mongoose.model('School', schoolSchema);
  
  module.exports = School;
  