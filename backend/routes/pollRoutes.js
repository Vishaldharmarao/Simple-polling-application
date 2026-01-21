const express = require('express');
const router = express.Router();
const PollController = require('../controllers/pollController');

// Get all polls
router.get('/', PollController.getAllPolls);

// Get specific poll with options
router.get('/:pollId', PollController.getPollDetails);

// Get poll results
router.get('/:pollId/results', PollController.getPollResults);

// Admin: Create new poll
router.post('/', PollController.createPoll);

// Admin: Update poll
router.put('/:pollId', PollController.updatePoll);

// Admin: Delete poll
router.delete('/:pollId', PollController.deletePoll);

// Admin: Add option to poll
router.post('/:pollId/options', PollController.addOption);

// Admin: Update option
router.put('/options/:optionId', PollController.updateOption);

// Admin: Delete option
router.delete('/options/:optionId', PollController.deleteOption);

// Admin: Reset votes for a poll
router.post('/:pollId/reset-votes', PollController.resetVotes);

module.exports = router;
