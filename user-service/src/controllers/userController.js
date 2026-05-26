const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Register User
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};