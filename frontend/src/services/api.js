import API from '../api';

export const authService = {
    register: (email, password) =>
        API.post('/auth/register', { email, password }),

    login: (email, password) =>
        API.post('/auth/login', { email, password }),

    getProfile: (userId) =>
        API.post('/auth/profile', { userId })
};

// Admin Management Service
export const adminService = {
    getAllUsers: (role = null) => {
        const params = role ? { role } : {};
        return API.get('/admin/users', { params, headers: { 'X-User-ID': localStorage.getItem('userId') || '' } });
    },

    getUserById: (userId) =>
        API.get(`/admin/users/${userId}`, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    createUser: (email, password, role) =>
        API.post('/admin/users', { email, password, role }, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    deleteUser: (userId) =>
        API.delete(`/admin/users/${userId}`, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    changeUserRole: (userId, role) =>
        API.put(`/admin/users/${userId}/role`, { role }, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    getAllFaculty: () =>
        API.get('/admin/faculty', { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    getAllStudents: () =>
        API.get('/admin/students', { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } })
};

export const pollService = {
    getAllPolls: (isActive = null) => {
        const params = isActive !== null ? { isActive } : {};
        return API.get('/polls', { params });
    },

    getActivePollsForUsers: () =>
        API.get('/polls/user/active'),

    getFacultyPolls: () => {
        const userId = localStorage.getItem('userId') || '';
        return API.get('/polls/faculty/my-polls', { headers: { 'X-User-ID': userId } });
    },

    getPollDetails: (pollId) =>
        API.get(`/polls/${pollId}`),

    getPollResults: (pollId) =>
        API.get(`/polls/${pollId}/results`, { headers: { 'X-User-ID': localStorage.getItem('userId') || '' } }),

    createPoll: (question, options, startTime = null, endTime = null) => {
        const userId = localStorage.getItem('userId') || '';
        return API.post('/polls', { question, options, startTime, endTime }, { headers: { 'X-User-ID': userId } });
    },

    updatePoll: (pollId, question, isActive) => {
        const userId = localStorage.getItem('userId') || '';
        return API.put(`/polls/${pollId}`, { question, isActive }, { headers: { 'X-User-ID': userId } });
    },

    deletePoll: (pollId) => {
        const userId = localStorage.getItem('userId') || '';
        return API.delete(`/polls/${pollId}`, { headers: { 'X-User-ID': userId } });
    },

    addOption: (pollId, optionText) => {
        const userId = localStorage.getItem('userId') || '';
        return API.post(`/polls/${pollId}/options`, { optionText }, { headers: { 'X-User-ID': userId } });
    },

    updateOption: (optionId, optionText) => {
        const userId = localStorage.getItem('userId') || '';
        return API.put(`/polls/options/${optionId}`, { optionText }, { headers: { 'X-User-ID': userId } });
    },

    deleteOption: (optionId) => {
        const userId = localStorage.getItem('userId') || '';
        return API.delete(`/polls/options/${optionId}`, { headers: { 'X-User-ID': userId } });
    },

    resetVotes: (pollId) => {
        const userId = localStorage.getItem('userId') || '';
        return API.post(`/polls/${pollId}/reset-votes`, {}, { headers: { 'X-User-ID': userId } });
    },

    updatePollSchedule: (pollId, startTime, endTime) => {
        const userId = localStorage.getItem('userId') || '';
        return API.patch(`/polls/${pollId}/schedule`, { startTime, endTime }, { headers: { 'X-User-ID': userId } });
    }
};

export const voteService = {
    submitVote: (userId, pollId, optionId) =>
        API.post('/votes', { userId, pollId, optionId }, { headers: { 'X-User-ID': userId } }),

    checkUserVote: (userId, pollId) =>
        API.get('/votes/check', { params: { userId, pollId }, headers: { 'X-User-ID': userId } })
};
