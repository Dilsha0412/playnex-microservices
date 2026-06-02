const matchService = require('../services/matchService');

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
        res.json(match);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};