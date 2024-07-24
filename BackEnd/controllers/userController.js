// controllers/userController.js
// const User = require('../models/User.model');

// Get user details by ID
exports.getUserById = async (req, res) => {
    try {
     res.status(200).json({user: req.user})
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



