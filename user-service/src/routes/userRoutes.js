const express = require('express');
const router = express.Router();

const { registerUser, getAllUsers, getUserById, deleteUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

module.exports = router;