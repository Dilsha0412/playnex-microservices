const Leaderboard = require('../models/Leaderboard');

// Update leaderboard after match
exports.updateLeaderboard = async (winnerId, loserId) => {

    // Winner update
    let winner = await Leaderboard.findOne({ userId: winnerId });

    if (!winner) {
        winner = new Leaderboard({ userId: winnerId });
    }

    winner.points += 3;
    winner.wins += 1;

    await winner.save();

    // Loser update
    let loser = await Leaderboard.findOne({ userId: loserId });

    if (!loser) {
        loser = new Leaderboard({ userId: loserId });
    }

    loser.losses += 1;

    await loser.save();

    return { winner, loser };
};

// Get leaderboard
exports.getLeaderboard = async () => {
    return await Leaderboard.find().sort({ points: -1 });
};

// Add raw score from mini games
exports.addScore = async (userId, score) => {
    let userRecord = await Leaderboard.findOne({ userId });

    if (!userRecord) {
        userRecord = new Leaderboard({ userId });
    }

    userRecord.points += score;
    await userRecord.save();

    return userRecord;
};