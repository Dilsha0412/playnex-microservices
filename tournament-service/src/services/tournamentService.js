const Tournament = require('../models/Tournament');

// Create Tournament
exports.createTournament = async (data) => {
    const maxPlayers = parseInt(data.maxPlayers, 10);
    if (![2, 4, 8, 16].includes(maxPlayers)) {
        throw new Error('Tournament player limit must be exactly 2, 4, 8, or 16.');
    }
    const tournament = new Tournament({ ...data, maxPlayers });
    return await tournament.save();
};

// Join Tournament
exports.joinTournament = async (tournamentId, userId) => {
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) throw new Error('Tournament not found');

    if (tournament.players.length >= tournament.maxPlayers) {
        throw new Error('Tournament full');
    }

    tournament.players.push(userId);
    return await tournament.save();
};

// Get All Tournaments
exports.getAllTournaments = async () => {
    return await Tournament.find();
};

// Update Tournament
exports.updateTournament = async (id, data) => {
    if (data.maxPlayers !== undefined) {
        const maxPlayers = parseInt(data.maxPlayers, 10);
        if (![2, 4, 8, 16].includes(maxPlayers)) {
            throw new Error('Tournament player limit must be exactly 2, 4, 8, or 16.');
        }
        data.maxPlayers = maxPlayers;
    }
    return await Tournament.findByIdAndUpdate(id, data, { new: true });
};

// Delete Tournament
exports.deleteTournament = async (id) => {
    return await Tournament.findByIdAndDelete(id);
};