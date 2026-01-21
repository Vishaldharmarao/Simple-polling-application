const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/voteController');

// Submit a vote
router.post('/', VoteController.submitVote);

// Check if user has voted on a poll
router.get('/check', VoteController.checkUserVote);

module.exports = router;
