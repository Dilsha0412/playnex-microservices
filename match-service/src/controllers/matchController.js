const matchService = require('../services/matchService');
const axios = require('axios'); // 1. Imported Axios for microservice communication

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
        // 2. Mark the match as completed and set the winner in the Match DB
        const match = await matchService.addResult(matchId, winnerId);

        // 3. Dynamically find the loserId from the players array
        // It looks for the player whose ID does NOT equal the winnerId
        const loserId = match.players.find(player => player.toString() !== winnerId.toString());

        // 4. Microservice Communication: Trigger Leaderboard Update on Port 5003
        try {
            await axios.post('http://localhost:5003/api/leaderboard/update', {
                winnerId: winnerId,
                loserId: loserId
            });
            console.log("🚀 Leaderboard synced successfully!");
        } catch (axiosError) {
            // We use an internal try-catch block so that if the leaderboard service is down, 
            // it won't crash the entire match-service response.
            console.error("⚠️ Match completed, but Leaderboard sync failed:", axiosError.message);
        }

        // 5. Send back the updated match data to Postman
        res.json(match);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};