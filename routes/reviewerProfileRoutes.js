const express = require('express');
const multer = require('multer');
const router = express.Router();
const profileController = require('../controllers/reviewerProfileController');
const upload = multer({ storage: multer.memoryStorage() });
const reviewerAuth = require('../middleware/reviewerAuthMiddleware');

router.post('/upload-profile-image', reviewerAuth, upload.single("profileImage"), profileController.uploadProfileImage);
router.post('/upload-signature', reviewerAuth, upload.single("signature"), profileController.uploadSignature);
// router.get('/get-balance', reviewerAuth, profileController.getBalance);
// router.get('/get-stats', reviewerAuth, profileController.getStats);

module.exports = router;