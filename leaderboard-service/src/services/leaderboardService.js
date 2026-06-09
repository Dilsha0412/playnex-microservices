const Leaderboard = require('../models/Leaderboard');

// Update leaderboard after match (wins/losses only, no points)
exports.updateLeaderboard = async (winnerId, loserId, game = 'General') => {

    // Winner update
    let winner = await Leaderboard.findOne({ userId: winnerId, game });

    if (!winner) {
        winner = new Leaderboard({ userId: winnerId, game });
    }

    winner.wins += 1;

    await winner.save();

    // Loser update
    let loser = await Leaderboard.findOne({ userId: loserId, game });

    if (!loser) {
        loser = new Leaderboard({ userId: loserId, game });
    }

    loser.losses += 1;

    await loser.save();

    return { winner, loser };
};

// Get leaderboard
exports.getLeaderboard = async (game) => {
    const filter = game ? { game } : {};
    return await Leaderboard.find(filter).sort({ points: -1 });
};

// Add raw score from mini games
exports.addScore = async (userId, score, game = 'General') => {
    let userRecord = await Leaderboard.findOne({ userId, game });

    if (!userRecord) {
        userRecord = new Leaderboard({ userId, game });
    }

    userRecord.points += score;
    await userRecord.save();

    return userRecord;
};

// Update leaderboard using tournament final standings (placement points)
exports.updateTournamentStandings = async (game = 'General', standings = []) => {
    const results = [];
    for (const player of standings) {
        const { userId, rank } = player;
        let record = await Leaderboard.findOne({ userId, game });
        if (!record) {
            record = new Leaderboard({ userId, game });
        }
        
        // Award placement points based on final tournament rank position:
        // Rank 1: +12 points
        // Rank 2: +9 points
        // Rank 3: +7 points
        // Rank 4: +6 points
        // Rank 5: +4 points
        // Rank 6: +3 points
        // Rank 7: +2 points
        // Rank 8: +1 point
        let pointsToAdd = 0;
        if (rank === 1) pointsToAdd = 12;
        else if (rank === 2) pointsToAdd = 9;
        else if (rank === 3) pointsToAdd = 7;
        else if (rank === 4) pointsToAdd = 6;
        else if (rank === 5) pointsToAdd = 4;
        else if (rank === 6) pointsToAdd = 3;
        else if (rank === 7) pointsToAdd = 2;
        else if (rank === 8) pointsToAdd = 1;

        record.points += pointsToAdd;
        await record.save();
        results.push(record);
    }
    return results;
};