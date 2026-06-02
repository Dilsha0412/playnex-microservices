const Match = require('../models/Match');

// Create Match
exports.createMatch = async (data) => {
    const match = new Match(data);
    return await match.save();
};

// Add Result
exports.addResult = async (matchId, winnerId) => {
    const match = await Match.findById(matchId);

    if (!match) throw new Error('Match not found');

    match.winner = winnerId;
    match.status = 'completed';

    return await match.save();
};