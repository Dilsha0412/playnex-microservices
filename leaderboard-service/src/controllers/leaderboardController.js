const leaderboardService = require('../services/leaderboardService');

// Update leaderboard
exports.updateLeaderboard = async (req, res) => {
    const { winnerId, loserId, game } = req.body;

    try {
        const result = await leaderboardService.updateLeaderboard(winnerId, loserId, game);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { game } = req.query;
        const data = await leaderboardService.getLeaderboard(game);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add raw score
exports.addScore = async (req, res) => {
    const { userId, score, game } = req.body;
    try {
        const result = await leaderboardService.addScore(userId, score, game);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Tournament completed standings sync
exports.tournamentCompleted = async (req, res) => {
    const { game, standings } = req.body;
    try {
        const result = await leaderboardService.updateTournamentStandings(game, standings);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};