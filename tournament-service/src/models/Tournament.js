const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    game: { type: String, required: true },
    maxPlayers: { type: Number, required: true },
    players: [{ type: String }], // user IDs
    status: { type: String, default: 'upcoming' }
});

module.exports = mongoose.model('Tournament', tournamentSchema);