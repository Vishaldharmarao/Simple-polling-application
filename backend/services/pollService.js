const { Poll, PollOption, Vote } = require('../models');

class PollService {
    static async getAllPolls(isActive = null) {
        return await Poll.getAll(isActive);
    }

    static async getPollWithOptions(pollId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const options = await PollOption.getByPollId(pollId);
        return { ...poll, options };
    }

    static async createPoll(question, options, createdBy) {
        if (!question || !options || options.length < 2) {
            throw new Error('Poll must have a question and at least 2 options');
        }

        const pollId = await Poll.create(question, createdBy);

        for (const option of options) {
            await PollOption.create(pollId, option);
        }

        return pollId;
    }

    static async updatePoll(pollId, question, isActive) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        await Poll.update(pollId, question, isActive);
    }

    static async deletePoll(pollId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        await Poll.delete(pollId);
    }

    static async addOption(pollId, optionText) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        return await PollOption.create(pollId, optionText);
    }

    static async updateOption(optionId, optionText) {
        await PollOption.update(optionId, optionText);
    }

    static async deleteOption(optionId) {
        await PollOption.delete(optionId);
    }

    static async getPollResults(pollId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const options = await PollOption.getByPollId(pollId);
        const votes = await Vote.getByPollId(pollId);
        const totalVotes = await Vote.getTotalVotesByPoll(pollId);

        const voteMap = {};
        votes.forEach(v => {
            voteMap[v.option_id] = v.count;
        });

        const results = options.map(option => ({
            id: option.id,
            text: option.option_text,
            votes: voteMap[option.id] || 0,
            percentage: totalVotes > 0 ? ((voteMap[option.id] || 0) / totalVotes * 100).toFixed(2) : 0
        }));

        return {
            poll: { id: poll.id, question: poll.question },
            totalVotes,
            results
        };
    }

    static async resetPollVotes(pollId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        await Vote.deleteByPollId(pollId);
    }
}

module.exports = PollService;
