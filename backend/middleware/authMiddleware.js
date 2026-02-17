/**
 * Authentication and Authorization Middleware
 * Validates user roles and permissions
 */

const { User } = require('../models');

/**
 * Verify user exists and return user data
 * Expects userId in request body
 */
const verifyUser = async (req, res, next) => {
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

        // Attach user to request for next middleware
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Check if user has required role
 */
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
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

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            res.status(403).json({
                success: false,
                error: error.message
            });
        }
    };
};

/**
 * Check if user is FACULTY or ADMIN
 */
const requireFacultyOrAdmin = requireRole(['faculty', 'admin']);

/**
 * Check if user is ADMIN only
 */
const requireAdmin = requireRole(['admin']);

/**
 * Check if user is USER (student)
 */
const requireUser = requireRole(['user']);

/**
 * Check if user is FACULTY only (not admin)
 */
const requireFacultyOnly = requireRole(['faculty']);

module.exports = {
    verifyUser,
    requireRole,
    requireFacultyOrAdmin,
    requireAdmin,
    requireUser,
    requireFacultyOnly
};
