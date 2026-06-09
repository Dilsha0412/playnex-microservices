const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    tournamentId: { type: String, required: true },
    players: [{ type: String }], // user IDs
    winner: { type: String, default: null },
    status: { type: String, default: 'pending' },
    matchIndex: { type: Number, default: null }
});

module.exports = mongoose.model('Match', matchSchema);