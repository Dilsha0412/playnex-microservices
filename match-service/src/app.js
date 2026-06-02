const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/matches', require('./routes/matchRoutes'));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Match Service running on port ${PORT}`);
});