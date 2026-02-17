/**
 * Admin Verification Middleware
 * Ensures user is an admin before accessing protected routes
 */

const { User } = require('../models');

/**
 * Middleware to verify admin role
 * Checks userId from header or body
 */
const verifyAdmin = async (req, res, next) => {
    try {
        const userId = req.body.userId || req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required'
            });
        }

        // Attach user to request for use in controllers
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = verifyAdmin;
