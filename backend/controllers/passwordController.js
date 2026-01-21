/**
 * ⚠️ PASSWORD CONTROLLER - EDUCATIONAL PURPOSE ONLY
 * 
 * Handles password change and reset requests
 * WARNING: Uses plain text password comparison
 * NEVER use this approach in production!
 */

const PasswordService = require('../services/passwordService');

class PasswordController {
    /**
     * Change Password Endpoint
     * User must provide current password and new password
     * 
     * Request Body:
     * {
     *   userId: number,
     *   currentPassword: string,
     *   newPassword: string
     * }
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    static async changePassword(req, res) {
        try {
            const { userId, currentPassword, newPassword } = req.body;

            // Input validation
            if (!userId || !currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID, current password, and new password are required'
                });
            }

            // Call service to change password
            await PasswordService.changePassword(userId, currentPassword, newPassword);

            // ⚠️ Never log the password
            console.log(`[Password Changed] User ID: ${userId}`);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error.message);

            // Return appropriate error based on message
            if (error.message.includes('incorrect')) {
                return res.status(401).json({
                    success: false,
                    error: error.message
                });
            }

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Admin Reset Password Endpoint
     * Admin can reset any user's password without verification
     * 
     * Request Body:
     * {
     *   adminId: number,
     *   userId: number,
     *   newPassword: string
     * }
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    static async adminResetPassword(req, res) {
        try {
            const { adminId, userId, newPassword } = req.body;

            // Input validation
            if (!adminId || !userId || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Admin ID, user ID, and new password are required'
                });
            }

            // Optional: Verify admin role from request
            // This should be done via JWT middleware in production
            // if (req.user.role !== 'admin') {
            //     return res.status(403).json({
            //         success: false,
            //         error: 'Only admins can reset passwords'
            //     });
            // }

            // Call service to reset password
            await PasswordService.adminResetPassword(adminId, userId, newPassword);

            // ⚠️ Log reset action for audit trail
            console.log(`[Password Reset] Admin ID: ${adminId}, User ID: ${userId}`);

            res.json({
                success: true,
                message: 'Password reset successfully by admin'
            });

        } catch (error) {
            console.error('Admin reset password error:', error.message);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Check Password Strength Endpoint
     * Provides feedback on password quality (optional utility)
     * 
     * Request Body:
     * {
     *   password: string
     * }
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    static async checkPasswordStrength(req, res) {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Password is required'
                });
            }

            const strength = PasswordService.checkPasswordStrength(password);

            res.json({
                success: true,
                strength: strength
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = PasswordController;
