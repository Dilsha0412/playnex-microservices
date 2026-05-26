const tournamentService = require('../services/tournamentService');

// Create Tournament
exports.createTournament = async (req, res) => {
    try {
        const tournament = await tournamentService.createTournament(req.body);
        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Join Tournament
exports.joinTournament = async (req, res) => {
    const { tournamentId, userId } = req.body;

    try {
        const tournament = await tournamentService.joinTournament(tournamentId, userId);
        res.json(tournament);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};