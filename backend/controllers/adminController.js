/**
 * Admin Controller
 * Handles admin-specific operations: user management
 */

const AdminService = require('../services/adminService');
const { User } = require('../models');

class AdminController {
    /**
     * Get all users with optional role filter
     */
    static async getAllUsers(req, res) {
        try {
            const { role } = req.query;
            const users = await AdminService.getAllUsers(role);

            res.json({
                success: true,
                count: users.length,
                users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get single user by ID
     */
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const user = await AdminService.getUserById(userId);

            res.json({
                success: true,
                user
            });
        } catch (error) {
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Create new user (student or faculty)
     */
    static async createUser(req, res) {
        try {
            const { email, password, role } = req.body;
            const adminId = req.user.id;

            const userId = await AdminService.createUser(email, password, role, adminId);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                userId
            });
        } catch (error) {
            res.status(error.message.includes('already registered') ? 400 : 500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete user by ID
     */
    static async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const adminId = req.user.id;

            const result = await AdminService.deleteUser(userId, adminId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 
                              error.message.includes('Cannot delete') ? 403 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Change user role (student ↔ faculty)
     */
    static async changeUserRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;
            const adminId = req.user.id;

            const result = await AdminService.changeUserRole(userId, role, adminId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 
                              error.message.includes('Cannot') ? 403 : 500;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get all users by role
     */
    static async getUsersByRole(req, res) {
        try {
            const { role } = req.params;

            const users = await AdminService.getUsersByRole(role);

            res.json({
                success: true,
                count: users.length,
                users
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get all students
     */
    static async getAllStudents(req, res) {
        try {
            const students = await AdminService.getAllStudents();

            res.json({
                success: true,
                count: students.length,
                students
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get all faculty
     */
    static async getAllFaculty(req, res) {
        try {
            const faculty = await AdminService.getAllFaculty();

            res.json({
                success: true,
                count: faculty.length,
                faculty
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Get all admins
     */
    static async getAllAdmins(req, res) {
        try {
            const admins = await User.findByRole('admin');

            res.json({
                success: true,
                count: admins.length,
                admins
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = AdminController;
