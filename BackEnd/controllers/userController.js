// controllers/userController.js
// const User = require('../models/User');

// Get user details by ID
exports.getUserById = async (req, res) => {
    try {
     res.status(200).json({user: req.user})
    // const { userId } = req.user;

    // // Find the user by ID
    // const user = await User.findById(userId).select('-password'); // Exclude password from response
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


