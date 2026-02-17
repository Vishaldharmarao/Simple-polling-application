/**
 * Admin Routes
 * All routes require admin role
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/roleMiddleware');

// All admin routes require admin authentication
router.use(verifyAdmin);

// User Management
router.get('/users', AdminController.getAllUsers);
router.get('/users/role/:role', AdminController.getUsersByRole);
router.get('/users/:userId', AdminController.getUserById);
router.post('/users', AdminController.createUser);
router.delete('/users/:userId', AdminController.deleteUser);
router.put('/users/:userId/role', AdminController.changeUserRole);

// Convenience endpoints
router.get('/faculty', AdminController.getAllFaculty);
router.get('/students', AdminController.getAllStudents);
router.get('/admins', AdminController.getAllAdmins);

module.exports = router;
