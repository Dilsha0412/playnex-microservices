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