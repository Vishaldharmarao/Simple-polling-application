const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Public Routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected Routes (user must pass userId in body)
router.post('/profile', AuthController.getProfile);

module.exports = router;
