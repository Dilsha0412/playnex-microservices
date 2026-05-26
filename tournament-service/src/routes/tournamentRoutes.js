const express = require('express');
const router = express.Router();
const {
    createTournament,
    joinTournament
} = require('../controllers/tournamentController');

router.post('/create', createTournament);
router.post('/join', joinTournament);

module.exports = router;