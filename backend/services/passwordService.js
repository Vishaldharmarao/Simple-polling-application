/**
 * ⚠️ PASSWORD SERVICE - EDUCATIONAL PURPOSE ONLY
 * 
 * WARNING: This service uses PLAIN TEXT passwords
 * NEVER use this in production!
 * 
 * Production-safe approach:
 * - Use bcrypt or Argon2 for password hashing
 * - Hash passwords before storing
 * - Never display or log passwords
 * - Use secure password reset tokens (JWT with expiration)
 */

const { User } = require('../models');

class PasswordService {
    /**
     * Change password - User provides current password
     * 
     * Security Notes:
     * - Compares passwords directly (plain text) - FOR LEARNING ONLY
     * - In production: use bcrypt.compare()
     * 
     * @param {number} userId - User ID
     * @param {string} currentPassword - Current password (plain text)
     * @param {string} newPassword - New password (plain text)
     * @returns {Promise<boolean>} - Success status
     */
    static async changePassword(userId, currentPassword, newPassword) {
        // Validation
        if (!userId || !currentPassword || !newPassword) {
            throw new Error('User ID, current password, and new password are required');
        }

        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }

        if (currentPassword === newPassword) {
            throw new Error('New password must be different from current password');
        }

        // ⚠️ EDUCATIONAL: Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // ⚠️ DIRECT COMPARISON - PLAIN TEXT PASSWORD
        // This is INSECURE and only for learning purposes
        // In production: use bcrypt.compare(currentPassword, user.password_hash)
        if (user.password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }

        // ⚠️ UPDATE WITH PLAIN TEXT
        // In production: hash the password before storing
        return await this.updatePassword(userId, newPassword);
    }

    /**
     * Admin reset password - Admin sets new password directly
     * 
     * Security Notes:
     * - No validation of current password needed
     * - Admin can reset any user's password
     * - Should be used only for lost password scenarios
     * 
     * @param {number} adminId - Admin user ID
     * @param {number|string} targetUserId - User to reset password for
     * @param {string} newPassword - New password (plain text)
     * @returns {Promise<boolean>} - Success status
     */
    static async adminResetPassword(adminId, targetUserId, newPassword) {
        // Validation
        if (!adminId || !targetUserId || !newPassword) {
            throw new Error('Admin ID, target user ID, and new password are required');
        }

        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }

        // ⚠️ Verify admin has admin role (optional check)
        // In production: use middleware to verify admin role from JWT token
        // const admin = await User.findById(adminId);
        // if (admin.role !== 'admin') {
        //     throw new Error('Only admins can reset passwords');
        // }

        // Verify target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            throw new Error('Target user not found');
        }

        // ⚠️ UPDATE WITH PLAIN TEXT (no current password verification)
        return await this.updatePassword(targetUserId, newPassword);
    }

    /**
     * Internal method: Update password in database
     * 
     * @param {number} userId - User ID
     * @param {string} newPassword - New password (plain text)
     * @returns {Promise<boolean>} - Success status
     */
    static async updatePassword(userId, newPassword) {
        try {
            // ⚠️ EDUCATIONAL: Store password as plain text
            // In production: 
            // const hashedPassword = await bcrypt.hash(newPassword, 10);
            // and store hashedPassword instead

            const pool = require('../db/connection');
            
            const [result] = await pool.query(
                `UPDATE users 
                 SET password = ?, password_changed_at = NOW() 
                 WHERE id = ?`,
                [newPassword, userId]  // ⚠️ PLAIN TEXT PASSWORD
            );

            if (result.affectedRows === 0) {
                throw new Error('Failed to update password');
            }

            return true;
        } catch (error) {
            throw new Error(`Password update failed: ${error.message}`);
        }
    }

    /**
     * Verify password (educational comparison)
     * 
     * @param {string} providedPassword - Password provided by user
     * @param {string} storedPassword - Password stored in database
     * @returns {boolean} - Passwords match
     */
    static verifyPassword(providedPassword, storedPassword) {
        // ⚠️ EDUCATIONAL: Direct string comparison
        // In production: use bcrypt.compare(providedPassword, storedPassword)
        return providedPassword === storedPassword;
    }

    /**
     * Get password strength feedback (optional utility)
     * 
     * @param {string} password - Password to check
     * @returns {object} - Strength assessment
     */
    static checkPasswordStrength(password) {
        const strength = {
            score: 0,
            feedback: []
        };

        if (password.length >= 12) {
            strength.score += 2;
            strength.feedback.push('✓ Good length (12+ characters)');
        } else if (password.length >= 8) {
            strength.score += 1;
            strength.feedback.push('• Acceptable length (8+ characters)');
        } else {
            strength.feedback.push('✗ Too short (minimum 6 characters)');
        }

        if (/[A-Z]/.test(password)) {
            strength.score += 1;
            strength.feedback.push('✓ Contains uppercase letters');
        } else {
            strength.feedback.push('• Add uppercase letters for strength');
        }

        if (/[0-9]/.test(password)) {
            strength.score += 1;
            strength.feedback.push('✓ Contains numbers');
        } else {
            strength.feedback.push('• Add numbers for strength');
        }

        if (/[!@#$%^&*]/.test(password)) {
            strength.score += 1;
            strength.feedback.push('✓ Contains special characters');
        } else {
            strength.feedback.push('• Add special characters for strength');
        }

        return strength;
    }
}

module.exports = PasswordService;
