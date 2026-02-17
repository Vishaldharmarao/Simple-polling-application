import apiClient from './apiClient';

export const authService = {
    register: (email, password) =>
        apiClient.post('/auth/register', { email, password }),

    login: (email, password) =>
        apiClient.post('/auth/login', { email, password }),

    getProfile: (userId) =>
        apiClient.post('/auth/profile', { userId })
};

// Admin Management Service
export const adminService = {
    getAllUsers: (role = null) => {
        const params = role ? { role } : {};
        return apiClient.get('/admin/users', { params, headers: { 'X-User-ID': localStorage.getItem('userId') || '' } });
    },

    getUserById: (userId) =>
        apiClient.get(`/admin/users/${userId}`, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    createUser: (email, password, role) =>
        apiClient.post('/admin/users', { email, password, role }, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    deleteUser: (userId) =>
        apiClient.delete(`/admin/users/${userId}`, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    changeUserRole: (userId, role) =>
        apiClient.put(`/admin/users/${userId}/role`, { role }, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    getAllFaculty: () =>
        apiClient.get('/admin/faculty', { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    getAllStudents: () =>
        apiClient.get('/admin/students', { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } })
};

export const pollService = {
    getAllPolls: (isActive = null) => {
        const params = isActive !== null ? { isActive } : {};
        return apiClient.get('/polls', { params });
    },

    getActivePollsForUsers: () =>
        apiClient.get('/polls/user/active'),

    getFacultyPolls: () => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.get('/polls/faculty/my-polls', { headers: { 'X-User-ID': userId } });
    },

    getPollDetails: (pollId) =>
        apiClient.get(`/polls/${pollId}`),

    getPollResults: (pollId) =>
        apiClient.get(`/polls/${pollId}/results`, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    createPoll: (question, options, startTime = null, endTime = null) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.post('/polls', { question, options, startTime, endTime }, { headers: { 'X-User-ID': userId } });
    },

    updatePoll: (pollId, question, isActive) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.put(`/polls/${pollId}`, { question, isActive }, { headers: { 'X-User-ID': userId } });
    },

    deletePoll: (pollId) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.delete(`/polls/${pollId}`, { headers: { 'X-User-ID': userId } });
    },

    addOption: (pollId, optionText) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.post(`/polls/${pollId}/options`, { optionText }, { headers: { 'X-User-ID': userId } });
    },

    updateOption: (optionId, optionText) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.put(`/polls/options/${optionId}`, { optionText }, { headers: { 'X-User-ID': userId } });
    },

    deleteOption: (optionId) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.delete(`/polls/options/${optionId}`, { headers: { 'X-User-ID': userId } });
    },

    resetVotes: (pollId) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.post(`/polls/${pollId}/reset-votes`, {}, { headers: { 'X-User-ID': userId } });
    },

    updatePollSchedule: (pollId, startTime, endTime) => {
        const userId = localStorage.getItem('userId') || '';
        return apiClient.patch(`/polls/${pollId}/schedule`, { startTime, endTime }, { headers: { 'X-User-ID': userId } });
    }
};

export const voteService = {
    submitVote: (userId, pollId, optionId) =>
        apiClient.post('/votes', { userId, pollId, optionId }, { headers: { 'X-User-ID': userId } }),

    checkUserVote: (userId, pollId) =>
        apiClient.get('/votes/check', { params: { userId, pollId }, headers: { 'X-User-ID': userId } })
};
