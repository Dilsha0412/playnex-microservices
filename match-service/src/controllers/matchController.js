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

        // Resolve game name from tournament-service
        let gameName = 'General';
        try {
            const tournamentRes = await axios.get(`http://localhost:5001/api/tournaments`);
            const tournament = tournamentRes.data.find(t => t._id === match.tournamentId);
            if (tournament && tournament.game) {
                gameName = tournament.game;
            }
        } catch (tournamentError) {
            console.error("⚠️ Failed resolving game name from tournament-service:", tournamentError.message);
        }

        try {
            await axios.post('http://localhost:5003/api/leaderboard/update', {
                winnerId: winnerId,
                loserId: loserId,
                game: gameName
            });
            console.log(`🚀 Leaderboard synced successfully for game: ${gameName}!`);
        } catch (axiosError) {
            console.error("⚠️ Match completed, but Leaderboard sync failed:", axiosError.message);
        }

        res.json(match);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get Matches by Tournament
exports.getMatchesByTournament = async (req, res) => {
    try {
        const matches = await matchService.getMatchesByTournament(req.params.tournamentId);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};