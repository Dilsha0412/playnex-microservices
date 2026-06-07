const express = require('express');
const router = express.Router();
const {
    createTournament,
    joinTournament,
    getAllTournaments,
    updateTournament,
    deleteTournament
} = require('../controllers/tournamentController');

router.post('/create', createTournament);
router.post('/join', joinTournament);
router.get('/', getAllTournaments);
router.put('/:id', updateTournament);
router.delete('/:id', deleteTournament);

module.exports = router;