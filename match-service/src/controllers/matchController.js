const matchService = require('../services/matchService');
const axios = require('axios');

// Create Match
exports.createMatch = async (req, res) => {
    try {
        const match = await matchService.createMatch(req.body);
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Result
exports.addResult = async (req, res) => {
    const { matchId, winnerId } = req.body;

    try {
        const match = await matchService.addResult(matchId, winnerId);

        const loserId = match.players.find(player => player.toString() !== winnerId.toString());

        try {
            await axios.post('http://localhost:5003/api/leaderboard/update', {
                winnerId: winnerId,
                loserId: loserId
            });
            console.log("🚀 Leaderboard synced successfully!");
        } catch (axiosError) {
            console.error("⚠️ Match completed, but Leaderboard sync failed:", axiosError.message);
        }

        res.json(match);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};