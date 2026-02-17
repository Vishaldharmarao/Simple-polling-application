/**
 * Role-Based Authorization Middleware
 * Validates user roles and permissions
 */

const { User } = require('../models');

/**
 * Verify user is admin
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
                error: 'Access denied. Admin privileges required.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Verify user is faculty
 */
const verifyFaculty = async (req, res, next) => {
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

        if (user.role !== 'faculty') {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Faculty privileges required.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Verify user is student (has 'user' role)
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

        if (user.role !== 'user') {
            return res.status(403).json({
                success: false,
                error: 'Students only. Access denied.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Verify user is authenticated (any role)
 */
const verifyUserExists = async (req, res, next) => {
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

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    verifyAdmin,
    verifyFaculty,
    verifyUser,
    verifyUserExists
};
