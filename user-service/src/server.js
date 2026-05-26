const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to accept JSON data in the body

// Connect to Database
connectDB();

// Basic Health Check Route
app.get('/api/users/health', (req, res) => {
    res.status(200).json({ message: 'User Service is running! 🏃‍♂️💨' });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
});