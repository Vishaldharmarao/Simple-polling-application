const PollService = require('../services/pollService');

class PollController {
    static async getAllPolls(req, res) {
        try {
            const { isActive } = req.query;
            
            let isActiveFilter = null;
            if (isActive === 'true') isActiveFilter = true;
            if (isActive === 'false') isActiveFilter = false;

            const polls = await PollService.getAllPolls(isActiveFilter);

            res.json({
                success: true,
                polls
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getPollDetails(req, res) {
        try {
            const { pollId } = req.params;

            const pollData = await PollService.getPollWithOptions(pollId);

            res.json({
                success: true,
                poll: pollData
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    static async createPoll(req, res) {
        try {
            const { question, options, createdBy } = req.body;

            if (!createdBy) {
                return res.status(400).json({
                    success: false,
                    error: 'Admin ID is required'
                });
            }

            const pollId = await PollService.createPoll(question, options, createdBy);

            res.status(201).json({
                success: true,
                message: 'Poll created successfully',
                pollId
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updatePoll(req, res) {
        try {
            const { pollId } = req.params;
            const { question, isActive } = req.body;

            await PollService.updatePoll(pollId, question, isActive);

            res.json({
                success: true,
                message: 'Poll updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async deletePoll(req, res) {
        try {
            const { pollId } = req.params;

            await PollService.deletePoll(pollId);

            res.json({
                success: true,
                message: 'Poll deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    static async addOption(req, res) {
        try {
            const { pollId } = req.params;
            const { optionText } = req.body;

            if (!optionText) {
                return res.status(400).json({
                    success: false,
                    error: 'Option text is required'
                });
            }

            const optionId = await PollService.addOption(pollId, optionText);

            res.status(201).json({
                success: true,
                message: 'Option added successfully',
                optionId
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateOption(req, res) {
        try {
            const { optionId } = req.params;
            const { optionText } = req.body;

            await PollService.updateOption(optionId, optionText);

            res.json({
                success: true,
                message: 'Option updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async deleteOption(req, res) {
        try {
            const { optionId } = req.params;

            await PollService.deleteOption(optionId);

            res.json({
                success: true,
                message: 'Option deleted successfully'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getPollResults(req, res) {
        try {
            const { pollId } = req.params;

            const results = await PollService.getPollResults(pollId);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    static async resetVotes(req, res) {
        try {
            const { pollId } = req.params;

            await PollService.resetPollVotes(pollId);

            res.json({
                success: true,
                message: 'Poll votes have been reset'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = PollController;
