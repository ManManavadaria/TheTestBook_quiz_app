const mongoose = require('mongoose');

// School.model.js
const classSchema = new mongoose.Schema({
    className: {
      type: String,
      required: true,
    },
  });
  
  const Class = mongoose.model('Class', classSchema);
  
  module.exports = Class;
  