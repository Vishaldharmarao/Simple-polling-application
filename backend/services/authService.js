const bcrypt = require('bcrypt');
const { User } = require('../models');

class AuthService {
    static async register(email, password) {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (email.length < 3 || password.length < 6) {
            throw new Error('Email must be at least 3 characters and password must be at least 6 characters');
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await User.create(email, hashedPassword, 'user');
        return userId;
    }

    static async login(email, password) {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Return user data (without password)
        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }

    static async getUserById(userId) {
        return await User.findById(userId);
    }
}

module.exports = AuthService;
