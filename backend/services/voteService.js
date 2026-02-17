const { Vote, Poll, PollOption, User } = require('../models');

class VoteService {
    /**
     * Submit vote (USERS ONLY)
     * Check poll is active based on scheduling
     */
    static async submitVote(userId, pollId, optionId) {
        // Verify user exists
        const user = await User.findById(userId);
        if (!user || user.role !== 'user') {
            throw new Error('Only students can vote');
        }

        // Verify poll exists
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        // Check if poll is within active time window
        const now = new Date();
        if (poll.start_time) {
            const startTime = new Date(poll.start_time);
            if (now < startTime) {
                throw new Error('This poll is not yet open');
            }
        }

        if (poll.end_time) {
            const endTime = new Date(poll.end_time);
            if (now >= endTime) {
                throw new Error('This poll is now closed');
            }
        }

        if (!poll.is_active) {
            throw new Error('This poll is no longer active');
        }

        // Verify option exists
        const options = await PollOption.getByPollId(pollId);
        const optionExists = options.some(opt => opt.id === optionId);
        if (!optionExists) {
            throw new Error('Invalid option selected');
        }

        // Check if user has already voted (one vote per user per poll)
        const hasVoted = await Vote.userHasVoted(userId, pollId);
        if (hasVoted) {
            throw new Error('You have already voted on this poll');
        }

        // Submit vote
        const voteId = await Vote.create(userId, pollId, optionId);
        return voteId;
    }

    /**
     * Check if user has voted on a poll (USERS ONLY)
     */
    static async getUserVoteOnPoll(userId, pollId) {
        // Verify poll exists
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const hasVoted = await Vote.userHasVoted(userId, pollId);
        return hasVoted;
    }

    /**
     * Get user's vote on a specific poll (for displaying what they voted)
     * USERS can only see their own vote
     */
    static async getUserVoteDetails(userId, pollId) {
        const [rows] = await pool.query(
            `SELECT v.id, v.option_id, po.option_text 
             FROM votes v
             JOIN poll_options po ON v.option_id = po.id
             WHERE v.user_id = ? AND v.poll_id = ?`,
            [userId, pollId]
        );

        return rows[0] || null;
    }
}

module.exports = VoteService;
