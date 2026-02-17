const bcrypt = require('bcrypt');
const { User } = require('../models');

class AdminService {
    /**
     * Get all users with optional role filter
     */
    static async getAllUsers(role = null) {
        try {
            if (role) {
                // Validate role
                const validRoles = ['admin', 'faculty', 'user'];
                if (!validRoles.includes(role)) {
                    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
                }
                return await User.findByRole(role);
            }
            return await User.getAllUsers();
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }

    /**
     * Get single user by ID
     */
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    }

    /**
     * Create new user (admin creates faculty or user accounts)
     */
    static async createUser(email, password, role, adminId) {
        try {
            // Validate input
            if (!email || !password || !role) {
                throw new Error('Email, password, and role are required');
            }

            if (email.length < 3 || password.length < 6) {
                throw new Error('Email must be at least 3 characters and password must be at least 6 characters');
            }

            // Validate role - admin cannot create other admins via this route
            const validRoles = ['faculty', 'user'];
            if (!validRoles.includes(role)) {
                throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
            }

            // Check if email already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new Error('Email already registered');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const userId = await User.create(email, hashedPassword, role, adminId);
            return userId;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * Delete user by ID
     * - Cannot delete admin accounts
     * - Cannot delete yourself
     */
    static async deleteUser(userId, adminId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            // Prevent self-deletion first
            if (userId == adminId) {
                throw new Error('Cannot delete your own account');
            }

            // Get user to delete
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Prevent deletion of admin accounts
            if (user.role === 'admin') {
                throw new Error('Cannot delete admin accounts');
            }

            // Delete user (cascade delete handles related votes and polls)
            const result = await User.delete(userId);
            return result;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    /**
     * Change user role (faculty ↔ user)
     * - Cannot change admin roles
     */
    static async changeUserRole(userId, newRole, adminId) {
        try {
            if (!userId || !newRole) {
                throw new Error('User ID and new role are required');
            }

            // Validate new role
            const validRoles = ['faculty', 'user'];
            if (!validRoles.includes(newRole)) {
                throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
            }

            // Get user
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Cannot change admin roles
            if (user.role === 'admin') {
                throw new Error('Cannot change admin user roles');
            }

            // Prevent changing own role
            if (userId == adminId) {
                throw new Error('Cannot change your own role');
            }

            // Update role
            await User.updateRole(userId, newRole);
            return { success: true, message: 'User role updated successfully' };
        } catch (error) {
            throw new Error(`Failed to update user role: ${error.message}`);
        }
    }

    /**
     * Get users with specific role
     */
    static async getUsersByRole(role) {
        try {
            const validRoles = ['admin', 'faculty', 'user'];
            if (!validRoles.includes(role)) {
                throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
            }

            return await User.findByRole(role);
        } catch (error) {
            throw new Error(`Failed to fetch users by role: ${error.message}`);
        }
    }

    /**
     * Get all faculty users
     */
    static async getAllFaculty() {
        try {
            return await User.findByRole('faculty');
        } catch (error) {
            throw new Error(`Failed to fetch faculty: ${error.message}`);
        }
    }

    /**
     * Get all student users
     */
    static async getAllStudents() {
        try {
            return await User.findByRole('user');
        } catch (error) {
            throw new Error(`Failed to fetch students: ${error.message}`);
        }
    }
}

module.exports = AdminService;

