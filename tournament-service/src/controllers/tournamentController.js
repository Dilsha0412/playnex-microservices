const tournamentService = require('../services/tournamentService');
const axios = require('axios');

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

        try {
            const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
            console.log("User Found:", userResponse.data);
        } catch (axiosError) {
            return res.status(404).json({ error: "User not found in User Service. Join failed!" });
        }

        const tournament = await tournamentService.joinTournament(tournamentId, userId);
        res.json(tournament);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get All Tournaments
exports.getAllTournaments = async (req, res) => {
    try {
        const tournaments = await tournamentService.getAllTournaments();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Tournament
exports.updateTournament = async (req, res) => {
    try {
        const tournament = await tournamentService.updateTournament(req.params.id, req.body);
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Tournament
exports.deleteTournament = async (req, res) => {
    try {
        await tournamentService.deleteTournament(req.params.id);
        res.json({ message: 'Tournament deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};