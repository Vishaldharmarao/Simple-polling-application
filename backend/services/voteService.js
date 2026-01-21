const { Vote, Poll, PollOption } = require('../models');

class VoteService {
    static async submitVote(userId, pollId, optionId) {
        // Verify poll exists and is active
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
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

        // Check if user has already voted
        const hasVoted = await Vote.userHasVoted(userId, pollId);
        if (hasVoted) {
            throw new Error('You have already voted on this poll');
        }

        // Submit vote
        const voteId = await Vote.create(userId, pollId, optionId);
        return voteId;
    }

    static async getUserVoteOnPoll(userId, pollId) {
        const votes = await Vote.getByPollId(pollId);
        // This is a simple check - in production, you might want a dedicated method
        const hasVoted = await Vote.userHasVoted(userId, pollId);
        return hasVoted;
    }
}

module.exports = VoteService;
