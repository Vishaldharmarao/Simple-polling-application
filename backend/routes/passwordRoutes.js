/**
 * ⚠️ PASSWORD ROUTES - EDUCATIONAL PURPOSE ONLY
 * 
 * API Endpoints for password management
 * WARNING: Plain text password handling for learning only
 */

const express = require('express');
const router = express.Router();
const PasswordController = require('../controllers/passwordController');

/**
 * POST /api/password/change-password
 * 
 * User changes their own password
 * Requires: current password verification
 * 
 * Request Body:
 * {
 *   "userId": 1,
 *   "currentPassword": "oldPassword123",
 *   "newPassword": "newPassword456"
 * }
 * 
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Password changed successfully"
 * }
 * 
 * Response (Error - 400/401):
 * {
 *   "success": false,
 *   "error": "Current password is incorrect"
 * }
 */
router.post('/change-password', PasswordController.changePassword);

/**
 * POST /api/password/admin-reset
 * 
 * Admin resets any user's password
 * No current password verification required
 * 
 * Request Body:
 * {
 *   "adminId": 1,
 *   "userId": 5,
 *   "newPassword": "resetPassword123"
 * }
 * 
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Password reset successfully by admin"
 * }
 * 
 * Response (Error - 404):
 * {
 *   "success": false,
 *   "error": "User not found"
 * }
 */
router.post('/admin-reset', PasswordController.adminResetPassword);

/**
 * POST /api/password/check-strength
 * 
 * Check password strength and get feedback
 * Helpful for password validation
 * 
 * Request Body:
 * {
 *   "password": "MyP@ssw0rd123"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "strength": {
 *     "score": 4,
 *     "feedback": [
 *       "✓ Good length (12+ characters)",
 *       "✓ Contains uppercase letters",
 *       "✓ Contains numbers",
 *       "✓ Contains special characters"
 *     ]
 *   }
 * }
 */
router.post('/check-strength', PasswordController.checkPasswordStrength);

module.exports = router;
