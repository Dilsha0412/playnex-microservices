const express = require('express');
const router = express.Router();

const {
    updateLeaderboard,
    getLeaderboard,
    addScore,
    tournamentCompleted
} = require('../controllers/leaderboardController');

router.post('/update', updateLeaderboard);
router.post('/add-score', addScore);
router.post('/tournament-completed', tournamentCompleted);
router.get('/', getLeaderboard);

module.exports = router;