import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const userService = {
    register: (userData) => api.post('/api/users/register', userData),
    getProfile: (userId) => api.get(`/api/users/profile/${userId}`),
};

export const tournamentService = {
    getAll: () => api.get('/api/tournaments'),
    create: (data) => api.post('/api/tournaments/create', data),
};

export const leaderboardService = {
    getTopPlayers: () => api.get('/api/leaderboard'),
};

export default api;