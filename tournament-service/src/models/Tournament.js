const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    game: { type: String, required: true },
    maxPlayers: { type: Number, required: true, enum: [2, 4, 8, 16] },
    players: [{ type: String }], // user IDs
    status: { type: String, default: 'upcoming' },
    competitorType: { type: String, default: 'players', enum: ['players', 'teams'] }
});

module.exports = mongoose.model('Tournament', tournamentSchema);