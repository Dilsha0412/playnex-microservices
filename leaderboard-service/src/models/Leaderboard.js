const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);