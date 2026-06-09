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
    getProfile: (userId) => api.get(`/api/users/${userId}`),
    getAllUsers: () => api.get('/api/users'),
    deleteUser: (userId) => api.delete(`/api/users/${userId}`),
};

export const tournamentService = {
    getAll: () => api.get('/api/tournaments'),
    create: (data) => api.post('/api/tournaments/create', data),
    join: (tournamentId, userId) => api.post('/api/tournaments/join', { tournamentId, userId }),
    update: (id, data) => api.put(`/api/tournaments/${id}`, data),
    delete: (id) => api.delete(`/api/tournaments/${id}`),
};

export const leaderboardService = {
    getTopPlayers: (game) => api.get('/api/leaderboard', { params: game ? { game } : {} }),
    addScore: (userId, score) => api.post('/api/leaderboard/add-score', { userId, score }),
};

export const matchService = {
    create: (data) => api.post('/api/matches/create', data),
    addResult: (matchId, winnerId) => api.post('/api/matches/result', { matchId, winnerId }),
    getTournamentMatches: (tournamentId) => api.get(`/api/matches/tournament/${tournamentId}`),
};

export default api;