const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/voteController');
const { requireUser, verifyUser } = require('../middleware/authMiddleware');

// Submit a vote (users/students only)
router.post('/', requireUser, VoteController.submitVote);

// Check if user has voted on a poll (any authenticated user)
router.get('/check', verifyUser, VoteController.checkUserVote);

module.exports = router;
