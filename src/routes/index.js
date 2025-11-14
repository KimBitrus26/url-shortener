/* eslint-disable max-len */
const express = require('express');
const router = express.Router();

const { loginLimiter, refreshLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/authMiddleware");

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
router.route('/register').post(authController.createUser);
router.route('/auth/login').post(loginLimiter, authController.login);
router.route('/auth/refresh-token').post(refreshLimiter, authController.refreshToken);
router.route('/auth/logout').post(authController.logout);

// Password reset routes (public)
router.post("/forgot-password", authController.forgotPassword);
router.get("/verify-reset-token/:token", authController.verifyResetToken);
router.post("/reset-password", authController.resetPassword);

// Protected user profile route
router.route('/users/me').get(protect, userController.getUserProfile);
router.route('/users/me').patch(protect, userController.updateUserProfile);


module.exports = router;