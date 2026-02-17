const { User } = require('../models');
const VoteService = require('../services/voteService');

class VoteController {
    static async submitVote(req, res) {
        try {
            const { userId, pollId, optionId } = req.body;

            if (!userId || !pollId || !optionId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID, Poll ID, and Option ID are required'
                });
            }

            // Verify user has 'user' role (student)
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            if (user.role !== 'user') {
                return res.status(403).json({
                    success: false,
                    error: 'Only students can vote on polls. Faculty and admins cannot vote.'
                });
            }

            const voteId = await VoteService.submitVote(userId, pollId, optionId);

            res.status(201).json({
                success: true,
                message: 'Vote submitted successfully',
                voteId
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async checkUserVote(req, res) {
        try {
            const { userId, pollId } = req.query;

            if (!userId || !pollId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and Poll ID are required'
                });
            }

            const hasVoted = await VoteService.getUserVoteOnPoll(userId, pollId);

            res.json({
                success: true,
                hasVoted
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = VoteController;
