const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tournaments', require('./routes/tournamentRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Tournament Service running on port ${PORT}`);
});