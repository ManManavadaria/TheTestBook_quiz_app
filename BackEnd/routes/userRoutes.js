// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authJWT = require('../middlewares/authJWT');

// Example route to get user details, protected by auth middleware
router.get('/user', authJWT, userController.getUserById);

// Example route to update user details, protected by auth middleware
// router.put('/:userId', authMiddleware, userController.updateUser);

module.exports = router;
