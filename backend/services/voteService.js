const { Vote, Poll, PollOption, User } = require('../models');

class VoteService {
    /**
     * Submit vote (USERS ONLY)
     * Check poll is active based on scheduling
     */
    static async submitVote(userId, pollId, optionId) {
        // Verify user exists and is a student
        const user = await User.findById(userId);
        if (!user || user.role !== 'user') {
            throw new Error('Only students can vote');
        }

        // Verify poll exists (basic existence check)
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        // Validate poll timing entirely in MySQL using NOW() and session timezone
        // (session timezone must be set to IST, see server initialization).
        const pool = require('../db/connection');
        const [openRows] = await pool.query(
            `SELECT id FROM polls
             WHERE id = ?
             AND is_active = 1
             AND (start_time IS NULL OR start_time <= NOW())
             AND (end_time IS NULL OR end_time > NOW())`,
            [pollId]
        );

        if (!openRows || openRows.length === 0) {
            throw new Error('This poll is not open');
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
