const express = require('express');
const router = express.Router();
const PollController = require('../controllers/pollController');
const { requireUser, requireFacultyOnly, requireAdmin, verifyUser } = require('../middleware/authMiddleware');

// ⚠️ IMPORTANT: Specific routes MUST come before parameterized routes (/:id)

// Public Routes - Specific paths first
// Get all active polls for users (based on scheduling)
router.get('/user/active', PollController.getActivePollsForUsers);

// Admin-only routes - Specific paths
// Admin: View all polls (read-only)
router.get('/admin/all-polls', requireAdmin, PollController.getAllPolls);

// Faculty-only routes - Specific paths
// Faculty: Get their own polls
router.get('/faculty/my-polls', requireFacultyOnly, PollController.getFacultyPolls);

// Parameterized routes - these come AFTER specific paths
// Get specific poll with options
router.get('/:pollId', PollController.getPollDetails);

// Get poll results (restricted by role)
router.get('/:pollId/results', verifyUser, PollController.getPollResults);

// Faculty: Update poll (own polls only)
router.put('/:pollId', requireFacultyOnly, PollController.updatePoll);

// Faculty: Delete poll (own polls only)
router.delete('/:pollId', requireFacultyOnly, PollController.deletePoll);

// Faculty: Update poll schedule
router.patch('/:pollId/schedule', requireFacultyOnly, PollController.updatePollSchedule);

// Faculty: Add option to poll
router.post('/:pollId/options', requireFacultyOnly, PollController.addOption);

// Faculty: Update option
router.put('/options/:optionId', requireFacultyOnly, PollController.updateOption);

// Faculty: Delete option
router.delete('/options/:optionId', requireFacultyOnly, PollController.deleteOption);

// Create new poll with scheduling - POST must be last
router.post('/', requireFacultyOnly, PollController.createPoll);

module.exports = router;
