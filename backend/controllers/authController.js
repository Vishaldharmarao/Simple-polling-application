const AuthService = require('../services/authService');
const { User } = require('../models');

class AuthController {
    static async register(req, res) {
        try {
            const { email, password } = req.body;

            const userId = await AuthService.register(email, password);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                userId
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await AuthService.login(email, password);

            res.json({
                success: true,
                message: 'Login successful',
                user
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getProfile(req, res) {
        try {
            const userId = req.body.userId;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            const user = await AuthService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = AuthController;
