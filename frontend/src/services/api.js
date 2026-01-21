import apiClient from './apiClient';

export const authService = {
    register: (email, password) =>
        apiClient.post('/auth/register', { email, password }),

    login: (email, password) =>
        apiClient.post('/auth/login', { email, password }),

    getProfile: (userId) =>
        apiClient.post('/auth/profile', { userId })
};

export const pollService = {
    getAllPolls: (isActive = null) => {
        const params = isActive !== null ? { isActive } : {};
        return apiClient.get('/polls', { params });
    },

    getPollDetails: (pollId) =>
        apiClient.get(`/polls/${pollId}`),

    getPollResults: (pollId) =>
        apiClient.get(`/polls/${pollId}/results`),

    createPoll: (question, options, createdBy) =>
        apiClient.post('/polls', { question, options, createdBy }),

    updatePoll: (pollId, question, isActive) =>
        apiClient.put(`/polls/${pollId}`, { question, isActive }),

    deletePoll: (pollId) =>
        apiClient.delete(`/polls/${pollId}`),

    addOption: (pollId, optionText) =>
        apiClient.post(`/polls/${pollId}/options`, { optionText }),

    updateOption: (optionId, optionText) =>
        apiClient.put(`/polls/options/${optionId}`, { optionText }),

    deleteOption: (optionId) =>
        apiClient.delete(`/polls/options/${optionId}`),

    resetVotes: (pollId) =>
        apiClient.post(`/polls/${pollId}/reset-votes`)
};

export const voteService = {
    submitVote: (userId, pollId, optionId) =>
        apiClient.post('/votes', { userId, pollId, optionId }),

    checkUserVote: (userId, pollId) =>
        apiClient.get('/votes/check', { params: { userId, pollId } })
};
