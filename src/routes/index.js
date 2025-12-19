/* eslint-disable max-len */
const express = require('express');
const router = express.Router();

const { loginLimiter, refreshLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/authMiddleware");
const { userSignupValidation, loginValidation, forgotPasswordEmailValidation, resetPasswordValidation } = require("../validators/authValidators")
const { profileUpdateValidation } = require("../validators/userValidators");
const validate = require("../middleware/validate");

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');


router.route('/').get((req, res) => res.json(
    {  
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: [
      'GET /api/'
     
    ]}
));

// auth routes
router.route('/auth/register').post( validate(userSignupValidation), authController.createUser);
router.route('/auth/login').post(loginLimiter, validate(loginValidation), authController.login);
router.route('/auth/refresh-token').post(refreshLimiter, authController.refreshToken);
router.route('/auth/logout').post(authController.logout);

// Password reset routes (public)
router.post("/auth/forgot-password",  validate(forgotPasswordEmailValidation), authController.forgotPassword);
router.get("/auth/verify-reset-token/:token",  authController.verifyResetToken);
router.post("/auth/reset-password", validate(resetPasswordValidation), authController.resetPassword);

// Phone verification routes (protected)
router.post("/auth/verify-phone", authController.verifyPhoneController);
router.post("/auth/resend-otp", authController.resendOtpController);

// Protected user profile route
router.route('/users/me').get(protect, userController.getUserProfile);
router.route('/users/me').patch(protect, validate(profileUpdateValidation), userController.updateUserProfile);


module.exports = router;