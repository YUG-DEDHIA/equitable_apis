const express = require('express');
const multer = require('multer');
const router = express.Router();
const profileController = require('../controllers/userProfileController');
const upload = multer({ storage: multer.memoryStorage() });
const userAuth = require('../middleware/userAuthMiddleware');

router.post('/upload-profile-image', userAuth, upload.single("profileImage"), profileController.uploadProfileImage);

module.exports = router;