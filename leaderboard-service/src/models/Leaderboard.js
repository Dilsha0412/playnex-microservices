const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    game: { type: String, required: true, default: 'General' },
    points: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
});

leaderboardSchema.index({ userId: 1, game: 1 }, { unique: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);