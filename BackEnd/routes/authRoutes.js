// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Example route for user login
// router.post('/login', authController.login);

// Example route for user registration
router.post('/register', authController.register);

router.post('/login',authController.signIn)

router.post('/register/verify-otp', authController.verifyRegistrationOTP);
router.post('/login/verify-otp', authController.verifySignInOTP);

module.exports = router;
