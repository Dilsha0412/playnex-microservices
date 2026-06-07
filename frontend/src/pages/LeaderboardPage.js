import React, { useEffect, useState } from 'react';
import { leaderboardService } from '../services/api';

const LeaderboardPage = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        leaderboardService.getTopPlayers()
            .then(response => {
                setPlayers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed fetching leaderboard:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '30px' }}>
            <h2>🏆 Global Leaderboard</h2>
            {loading ? (
                <p>Loading standings...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Rank</th>
                            <th style={{ padding: '12px' }}>Player Name</th>
                            <th style={{ padding: '12px' }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, index) => (
                            <tr key={player.id || index} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{index + 1}</td>
                                <td style={{ padding: '12px' }}>{player.username}</td>
                                <td style={{ padding: '12px' }}>{player.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LeaderboardPage;