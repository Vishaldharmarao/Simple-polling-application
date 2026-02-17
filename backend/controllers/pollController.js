const PollService = require('../services/pollService');

class PollController {
    /**
     * Get all polls (ADMIN ONLY)
     */
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

    /**
     * Get active polls for users (based on start_time and end_time)
     */
    static async getActivePollsForUsers(req, res) {
        try {
            const polls = await PollService.getActivePollsForUsers();

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

    /**
     * Get faculty's own polls
     */
    static async getFacultyPolls(req, res) {
        try {
            const facultyId = req.user.id;

            const polls = await PollService.getFacultyPolls(facultyId);

            res.json({
                success: true,
                polls
            });
        } catch (error) {
            res.status(400).json({
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

    /**
     * Create poll (FACULTY ONLY)
     * Can specify start_time and end_time for scheduling
     */
    static async createPoll(req, res) {
        try {
            const { question, options, startTime, endTime } = req.body;
            const facultyId = req.user.id;

            if (!question || !options || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Question and at least 2 options are required'
                });
            }

            const pollId = await PollService.createPoll(
                question,
                options,
                facultyId,
                startTime,
                endTime
            );

            res.status(201).json({
                success: true,
                message: 'Poll created successfully',
                pollId,
                startTime,
                endTime
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Update poll (FACULTY ONLY - own polls only)
     */
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

    /**
     * Update poll schedule (FACULTY ONLY)
     */
    static async updatePollSchedule(req, res) {
        try {
            const { pollId } = req.params;
            const { startTime, endTime } = req.body;
            const facultyId = req.user.id;

            if (!startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    error: 'Start time and end time are required'
                });
            }

            await PollService.updatePollSchedule(pollId, startTime, endTime, facultyId);

            res.json({
                success: true,
                message: 'Poll schedule updated successfully',
                startTime,
                endTime
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Delete poll (FACULTY ONLY - own polls only)
     */
    static async deletePoll(req, res) {
        try {
            const { pollId } = req.params;
            const facultyId = req.user.id;

            await PollService.deletePollByFaculty(pollId, facultyId);

            res.json({
                success: true,
                message: 'Poll deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
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

    /**
     * Get poll results (restricted by role)
     * Faculty can see results for their own polls only
     * Admin can see results for all polls (read-only)
     * Users cannot access this
     */
    static async getPollResults(req, res) {
        try {
            const { pollId } = req.params;
            const userId = req.user.id;

            const results = await PollService.getPollResults(pollId, userId);

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = PollController;
