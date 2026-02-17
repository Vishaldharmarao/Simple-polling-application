const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected Routes (user must pass userId in body)
router.post('/profile', AuthController.getProfile);

// Admin-only routes
router.post('/create-faculty', requireAdmin, AuthController.createFaculty);
router.post('/create-admin', requireAdmin, AuthController.createAdmin);

module.exports = router;
