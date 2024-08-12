// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

// Example route to get user details, protected by auth middleware
router.get('/user', auth.authUserJWT, userController.getUserById);

router.get('/user-details',auth.authUserJWT,userController.getPopulatedUser);

router.post('/submit-test',auth.authJWT,userController.submitGivenTest)

router.post('/scorecard',auth.authJWT,userController.getGivenTestByID)

router.post('/update-profile',auth.authUserJWT,userController.updateUserById)

router.get('/classes',userController.getAllClasses)
// Example route to update user details, protected by auth middleware
// router.put('/:userId', authMiddleware, userController.updateUser);

router.get('/schools',userController.getAllSchools);

module.exports = router;
