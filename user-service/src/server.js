const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/api/users/health', (req, res) => {
    res.status(200).json({ message: 'User Service is running! 🏃‍♂️💨' });
});

app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});