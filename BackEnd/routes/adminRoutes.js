// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });


router.get('/users', auth.authJWT,adminController.getAllUsers);
router.get('/create-test', auth.authJWT,adminController.processTestExcel);

router.post('/upload-test', 
    express.json(),
    upload.single('testFile'), 
    adminController.processTestExcel
  );

module.exports = router;
