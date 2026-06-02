const express = require('express');
const router = express.Router();

const {
    createMatch,
    addResult
} = require('../controllers/matchController');

router.post('/create', createMatch);
router.post('/result', addResult);

module.exports = router;