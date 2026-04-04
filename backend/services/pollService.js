const { Poll, PollOption, Vote, User } = require('../models');

class PollService {
    /**
     * Get all active polls (for users)
     * Returns only polls where current time is between start_time and end_time
     */
    static async getActivePollsForUsers() {
        return await Poll.getActivePolls();
    }

    /**
     * Get all polls (for admin view only) - with voting statistics
     */
    static async getAllPolls(isActive = null) {
        try {
            const polls = await Poll.getAll(isActive);
            
            // Enrich each poll with voting data
            const enrichedPolls = await Promise.all(polls.map(async (poll) => {
                try {
                    const totalVotes = await Vote.getTotalVotesByPoll(poll.id);
                    const votingStats = await this.getPollResults(poll.id);
                    return {
                        ...poll,
                        totalVotes: totalVotes || 0,
                        votingStats
                    };
                } catch (err) {
                    console.error(`Error enriching poll ${poll.id}:`, err);
                    return {
                        ...poll,
                        totalVotes: 0,
                        votingStats: { results: [] }
                    };
                }
            }));
            
            return enrichedPolls;
        } catch (err) {
            console.error('Error in getAllPolls:', err);
            throw err;
        }
    }

    /**
     * Get polls created by a specific faculty member - with voting statistics
     */
    static async getFacultyPolls(facultyId) {
        const faculty = await User.findById(facultyId);
        if (!faculty || faculty.role !== 'faculty') {
            throw new Error('User is not faculty');
        }

        const polls = await Poll.getByCreatedBy(facultyId);
        
        // Enrich each poll with voting data
        const enrichedPolls = await Promise.all(polls.map(async (poll) => {
            try {
                const totalVotes = await Vote.getTotalVotesByPoll(poll.id);
                const votingStats = await this.getPollResults(poll.id);
                return {
                    ...poll,
                    totalVotes: totalVotes || 0,
                    votingStats
                };
            } catch (err) {
                console.error(`Error enriching poll ${poll.id}:`, err);
                return {
                    ...poll,
                    totalVotes: 0,
                    votingStats: { results: [] }
                };
            }
        }));
        
        return enrichedPolls;
    }

    static async getPollWithOptions(pollId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        const options = await PollOption.getByPollId(pollId);
        return { ...poll, options };
    }

    /**
     * Create poll (FACULTY ONLY)
     * Faculty can set start_time and end_time for scheduling
     */
    static async createPoll(question, options, createdBy, startTime = null, endTime = null) {
        // Verify creator is faculty
        const creator = await User.findById(createdBy);
        if (!creator || creator.role !== 'faculty') {
            throw new Error('Only faculty can create polls');
        }

        // Validate poll content
        if (!question || !options || options.length < 2) {
            throw new Error('Poll must have a question and at least 2 options');
        }

        // NOTE: Do not perform timezone conversions or JS Date parsing here.
        // The frontend provides startTime and endTime as IST-formatted strings
        // ("YYYY-MM-DD HH:MM:SS"). We store them directly in the DB and rely
        // on MySQL's NOW() (with session timezone set to +05:30) for comparisons.

        const pollId = await Poll.create(question, createdBy, startTime, endTime);

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

    /**
     * Update poll schedule (FACULTY ONLY - only for their own polls)
     */
    static async updatePollSchedule(pollId, startTime, endTime, facultyId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        // Verify faculty owns this poll
        if (poll.created_by !== facultyId) {
            throw new Error('You can only update your own polls');
        }

        // NOTE: Do not perform timezone conversions or JS Date parsing here.
        // The frontend provides IST-formatted datetime strings; store them
        // directly and let MySQL perform any comparisons using NOW().

        await Poll.updateSchedule(pollId, startTime, endTime);
    }

    static async deletePoll(pollId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        await Poll.delete(pollId);
    }

    /**
     * Delete poll (FACULTY ONLY - only for their own polls)
     */
    static async deletePollByFaculty(pollId, facultyId) {
        const poll = await Poll.getById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        // Verify faculty owns this poll
        if (poll.created_by !== facultyId) {
            throw new Error('You can only delete your own polls');
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

    /**
     * Get poll results
     * Faculty can see results for their own polls
     * Admin can see results for all polls (read-only)
     * Users cannot see detailed results
     */
    static async getPollResults(pollId, userId = null) {
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
