const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Tournament = require('./models/Tournament');

dotenv.config();

const seedTournaments = async () => {
    try {
        const count = await Tournament.countDocuments();
        if (count === 0) {
            console.log("🌱 Database is empty. Seeding real-world game tournaments...");
            const tournaments = [
                {
                    name: "PUBG Master League 2026",
                    game: "PUBG: Battlegrounds (PC)",
                    maxPlayers: 16,
                    players: [],
                    status: "running"
                },
                {
                    name: "Valorant Champions Cup",
                    game: "Valorant (PC)",
                    maxPlayers: 16,
                    players: [],
                    status: "setup"
                },
                {
                    name: "League of Legends Rift Arena",
                    game: "League Of Legends (PC)",
                    maxPlayers: 16,
                    players: [],
                    status: "completed"
                }
            ];
            await Tournament.insertMany(tournaments);
            console.log("✅ Successfully seeded 3 tournaments!");
        }
    } catch (err) {
        console.error("⚠️ Failed seeding database:", err.message);
    }
};

connectDB().then(() => {
    seedTournaments();
});

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tournaments', require('./routes/tournamentRoutes'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Tournament Service running on port ${PORT}`);
});