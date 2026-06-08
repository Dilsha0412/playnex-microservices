const express = require('express');
const router = express.Router();

const {
    updateLeaderboard,
    getLeaderboard,
    addScore
} = require('../controllers/leaderboardController');

router.post('/update', updateLeaderboard);
router.post('/add-score', addScore);
router.get('/', getLeaderboard);

module.exports = router;