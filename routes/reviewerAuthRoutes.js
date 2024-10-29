const express = require('express');
const router = express.Router();
const authController = require('../controllers/reviewerAuthController');
const reviewerAuth = require('../middleware/reviewerAuthMiddleware');

router.post('/register', authController.register);
router.post('/login-email', authController.login);
router.post('/login-phone', authController.loginWithPhone);
router.post('/verify-otp-login', authController.verifyOtpForLogin);
router.get('/verifySession', authController.verifySession); 
router.post('/logout', reviewerAuth, authController.logout);

module.exports = router;