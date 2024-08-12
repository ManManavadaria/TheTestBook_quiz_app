// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middlewares/adminAuth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/user',adminAuth.authAdminJWT,adminController.createUser)
router.get('/users', adminAuth.authAdminJWT,adminController.getAllUsers);
router.get('/create-test', adminAuth.authAdminJWT,adminController.processTestExcel);
router.post('/allocate-test',adminAuth.authAdminJWT,adminController.addTestToUser)
router.get('/tests',adminAuth.authSuperAdminJWT,adminController.getAllTests);
router.put('/test',adminAuth.authAdminJWT,adminController.updateTestByID);
router.delete('/test',adminAuth.authAdminJWT,adminController.deleteTestByID)
router.get('/test/:testId',adminAuth.authAdminJWT,adminController.getTestByID);
router.post('/allow-test',adminAuth.authAdminJWT,adminController.allowtest)
router.get('/user-details/:userId',adminAuth.authAdminJWT,adminController.getPopulatedUser)
router.post('/update-user',adminAuth.authAdminJWT,adminController.updateUserById)
router.delete('/delete-user/:userId',adminAuth.authAdminJWT,adminController.deleteUserByID)
router.delete('/school/:schoolId',adminAuth.authAdminJWT,adminController.deleteSchool)
router.post('/school',adminAuth.authAdminJWT,adminController.AddSchool)
router.put('/school/:schoolId',adminAuth.authAdminJWT,adminController.editSchool)
router.delete('/class/:classId',adminAuth.authAdminJWT,adminController.deleteClass)
router.post('/class',adminAuth.authAdminJWT,adminController.addClass)
router.put('/class/:classId',adminAuth.authAdminJWT,adminController.editClass)
router.get('/submitted-tests/:schoolId',adminAuth.authAdminJWT,adminController.getGivenTestsBySchool)
router.post('/submitted-tests',adminAuth.authAdminJWT,adminController.getGivenTestsByClass)

router.post('/upload-test', 
    express.json(),
    upload.single('testFile'), 
    adminAuth.authAdminJWT,
    adminController.processTestExcel
  );

module.exports = router;
