const Tournament = require('../models/Tournament');

// Create Tournament
exports.createTournament = async (data) => {
    const tournament = new Tournament(data);
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