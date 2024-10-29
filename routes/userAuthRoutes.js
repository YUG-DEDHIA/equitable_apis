const express = require('express');
const router = express.Router();
const authController = require('../controllers/userAuthController');
const userAuth = require('../middleware/userAuthMiddleware');

router.post('/register', authController.register);
router.post('/login-email', authController.login);
router.post('/login-phone', authController.loginWithPhone);
router.post('/verify-otp-login', authController.verifyOtpForLogin);
router.get('/verifySession', authController.verifySession);
router.post('/logout', userAuth, authController.logout);

module.exports = router;