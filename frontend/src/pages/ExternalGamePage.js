import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardService } from '../services/api';

const ExternalGamePage = () => {
    const [statusMessage, setStatusMessage] = useState('Game running...');
    const [isGameOver, setIsGameOver] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const handleMessage = async (event) => {
            // Verify origin if needed (for now we accept localhost:8080)
            if (event.origin !== 'http://localhost:8080') return;

            const data = event.data;
            if (data && data.type === 'GAME_OVER') {
                console.log('Received Game Over from External Game:', data.score);
                setIsGameOver(true);
                setFinalScore(data.score);
                setStatusMessage('Submitting score to Leaderboard...');

                try {
                    const userId = localStorage.getItem('playnex_userId');
                    if (userId) {
                        await leaderboardService.addScore(userId, data.score);
                        setStatusMessage('Score Submitted Successfully!');
                        setTimeout(() => {
                            navigate('/leaderboard');
                        }, 2000);
                    } else {
                        setStatusMessage('User not logged in!');
                    }
                } catch (error) {
                    console.error('Failed to submit score:', error);
                    setStatusMessage('Failed to submit score.');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [navigate]);

    return (
        <div style={{ paddingBottom: '50px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>External Mini Game</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Playing Car Race on an external provider. 
                    Your score will automatically sync when the game ends!
                </p>
                {isGameOver && (
                    <div style={{ 
                        marginTop: '15px', 
                        padding: '15px', 
                        borderRadius: '8px', 
                        background: 'rgba(255, 85, 0, 0.1)', 
                        border: '1px solid var(--color-cyan)',
                        display: 'inline-block'
                    }}>
                        <h3 style={{ color: 'var(--color-cyan)', margin: 0 }}>{statusMessage}</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold' }}>Score: {finalScore}</p>
                    </div>
                )}
            </div>

            <div className="glass-panel" style={{ flex: 1, padding: '10px', overflow: 'hidden', minHeight: '650px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {!isGameOver ? (
                    <iframe 
                        src="http://localhost:8080" 
                        title="External Game"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                    />
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <h2>Game Over! Redirecting to Leaderboard...</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExternalGamePage;
