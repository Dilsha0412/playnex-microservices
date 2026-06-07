const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();

app.use(cors());

// User Service (5000)
app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/users/'
    }
}));

// Tournament Service (5001)
app.use('/api/tournaments', createProxyMiddleware({
    target: process.env.TOURNAMENT_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/tournaments/'
    }
}));

// Match Service (5002)
app.use('/api/matches', createProxyMiddleware({
    target: process.env.MATCH_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/matches/'
    }
}));

// Leaderboard Service (5003)
app.use('/api/leaderboard', createProxyMiddleware({
    target: process.env.LEADERBOARD_SERVICE,
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/leaderboard/'
    }
}));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running smoothly on port ${PORT}`);
});