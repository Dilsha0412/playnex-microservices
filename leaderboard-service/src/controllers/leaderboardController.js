const leaderboardService = require('../services/leaderboardService');

// Update leaderboard
exports.updateLeaderboard = async (req, res) => {
    const { winnerId, loserId } = req.body;

    try {
        const result = await leaderboardService.updateLeaderboard(winnerId, loserId);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const data = await leaderboardService.getLeaderboard();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};