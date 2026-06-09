const express = require('express');
const router = express.Router();

const {
    createMatch,
    addResult,
    getMatchesByTournament
} = require('../controllers/matchController');

router.post('/create', createMatch);
router.post('/result', addResult);
router.get('/tournament/:tournamentId', getMatchesByTournament);

module.exports = router;