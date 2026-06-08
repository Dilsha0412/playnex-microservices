const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(cors());

// Serve static files (the game)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`External Game Provider running on port ${PORT}`);
});
