import React, { useEffect, useState } from 'react';
import { leaderboardService, userService } from '../services/api';

const LeaderboardPage = () => {
    const [players, setPlayers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeFilter, setActiveFilter] = useState('weekly');

    useEffect(() => {
        const loadLeaderboardData = async () => {
            try {
                // Try resolving real backend users and leaderboard scores
                const [leaderboardRes, usersRes] = await Promise.all([
                    leaderboardService.getTopPlayers(),
                    userService.getAllUsers().catch(() => ({ data: [] }))
                ]);

                const userMap = {};
                if (usersRes.data) {
                    setAllUsers(usersRes.data);
                    usersRes.data.forEach(user => {
                        userMap[user._id] = user.username;
                    });
                }

                if (leaderboardRes.data && leaderboardRes.data.length > 0) {
                    // Map backend data
                    const formatted = leaderboardRes.data.map((item, index) => {
                        const pts = item.points || 0;
                        return {
                            id: item.userId,
                            username: userMap[item.userId] || `User_${item.userId.slice(-4)}`,
                            title: pts > 20 ? 'Master Champion' : pts > 10 ? 'Senior Challenger' : 'Elite Combatant',
                            score: pts,
                            level: pts > 20 ? 'Lv-3' : pts > 10 ? 'Lv-2' : 'Lv-1',
                            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userMap[item.userId] || item.userId}`,
                            wins: item.wins || 0,
                            losses: item.losses || 0
                        };
                    });
                    setPlayers(formatted);
                } else {
                    setPlayers([]);
                }
            } catch (err) {
                console.error("Failed loading leaderboard data:", err);
                setPlayers([]);
            }
        };

        loadLeaderboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Podium details
    const podiumPlayers = players.slice(0, 3);
    const tablePlayers = players.slice(3);

    // Arrange podium order dynamically based on active player count
    const sortedPodium = [];
    if (podiumPlayers[1]) sortedPodium.push({ ...podiumPlayers[1], rank: 2 });
    if (podiumPlayers[0]) sortedPodium.push({ ...podiumPlayers[0], rank: 1 });
    if (podiumPlayers[2]) sortedPodium.push({ ...podiumPlayers[2], rank: 3 });

    const layoutStyle = {
        display: 'grid',
        gridTemplateColumns: '3fr 1.3fr',
        gap: '30px',
    };

    const podiumBlockStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '20px',
        padding: '30px 0',
        marginBottom: '35px',
        background: 'radial-gradient(circle at center, rgba(123, 44, 191, 0.12) 0%, rgba(12, 8, 34, 0) 70%)',
        borderRadius: '16px',
        border: '1px solid var(--border-glass)'
    };

    const rightPaneStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    };

    const infoCardStyle = {
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        transition: 'var(--transition-smooth)'
    };

    return (
        <div style={{ paddingBottom: '60px' }}>
            <div style={layoutStyle} className="hidden-mobile-grid">

                {/* LEFT COLUMN: Standing Podium & List */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Leaderboard</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Top ranking athletes across the platform</p>
                        </div>

                        {/* Tab Filter */}
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                            {['weekly', 'monthly', 'all-time'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    style={{
                                        padding: '8px 16px',
                                        background: activeFilter === f ? 'var(--color-cyan)' : 'transparent',
                                        color: activeFilter === f ? '#0c0822' : 'var(--text-muted)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '700',
                                        textTransform: 'capitalize',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3D-style Podium Standings */}
                    {players.length > 0 && (
                        <div style={podiumBlockStyle}>
                            {sortedPodium.map((player) => {
                                const height = player.rank === 1 ? '160px' : player.rank === 2 ? '120px' : '100px';
                                const columnColor = player.rank === 1 ? 'linear-gradient(to top, #ff9f1c, #ffe169)' :
                                    player.rank === 2 ? 'linear-gradient(to top, #7b2cbf, #9d4edd)' :
                                        'linear-gradient(to top, #2ec4b6, #00f5d4)';
                                const scaleClass = player.rank === 1 ? 'float-anim' : '';

                                return (
                                    <div key={player.id} className={scaleClass} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px' }}>
                                        {/* Avatar & Icon */}
                                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                                            <img
                                                src={player.avatar}
                                                alt={player.username}
                                                style={{
                                                    width: player.rank === 1 ? '72px' : '60px',
                                                    height: player.rank === 1 ? '72px' : '60px',
                                                    borderRadius: '50%',
                                                    border: `3px solid ${player.rank === 1 ? 'var(--color-orange)' : player.rank === 2 ? 'var(--color-purple-light)' : 'var(--color-cyan)'}`,
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-5px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: '#0c0822',
                                                border: '1px solid var(--border-glass)',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color: '#fff'
                                            }}>
                                                {player.rank}
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <span style={{ fontWeight: '700', fontSize: '0.95rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', marginBottom: '4px' }}>
                                            {player.username}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                            {player.title}
                                        </span>

                                        {/* 3D Column Column */}
                                        <div style={{
                                            width: '100%',
                                            height: height,
                                            background: columnColor,
                                            borderRadius: '12px 12px 0 0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#0c0822',
                                            fontWeight: '800',
                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                                        }}>
                                            <span style={{ fontSize: '1.4rem' }}>NO.{player.rank}</span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{player.score.toFixed(0)} pts</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Standings Table Ranks 4+ */}
                    {tablePlayers.length > 0 && (
                        <div className="glass-panel" style={{ padding: '10px' }}>
                            <table className="game-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>Rank</th>
                                        <th>Player</th>
                                        <th>Title & Role</th>
                                        <th style={{ textAlign: 'right' }}>Score Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tablePlayers.map((player, index) => (
                                        <tr key={player.id}>
                                            <td>
                                                <strong style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>#{index + 4}</strong>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img src={player.avatar} alt={player.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    <div>
                                                        <span style={{ fontWeight: '700' }}>{player.username}</span>
                                                        <span style={{ marginLeft: '10px', fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'var(--color-cyan)' }}>{player.level}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{player.title}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-cyan">
                                                {player.score.toFixed(3)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty Leaderboard Fallback */}
                    {players.length === 0 && (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>No active rankings yet</h3>
                            <p style={{ fontSize: '0.9rem' }}>Sync tournament match outcomes using the Game API simulator to see rankings here!</p>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Active user detail pane */}
                <div style={rightPaneStyle}>

                    {/* User Profile Card */}
                    {(() => {
                        const activeUserId = localStorage.getItem('playnex_userId');
                        const activeUser = allUsers.find(u => u._id === activeUserId);
                        const activeLeaderboard = players.find(p => p.id === activeUserId);
                        
                        const activeUsername = activeUser ? activeUser.username : 'Dilsha Jayasekara';
                        const activeEmail = activeUser ? activeUser.email : 'dilsha@gmail.com';
                        const activeWins = activeLeaderboard ? activeLeaderboard.wins : 0;
                        const activeLosses = activeLeaderboard ? activeLeaderboard.losses : 0;
                        const activeAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeUsername}`;

                        return (
                            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '6px', cursor: 'pointer' }}>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </div>

                                <img
                                    src={activeAvatar}
                                    alt={activeUsername}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--color-cyan)', objectFit: 'cover', marginBottom: '12px' }}
                                />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>{activeUsername}</h2>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{activeEmail}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-cyan)' }}>{activeWins}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wins Tracker</span>
                                    </div>
                                    <div style={{ borderLeft: '1px solid var(--border-glass)' }}>
                                        <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-pink)' }}>{activeLosses}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Losses Tracker</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Insights list matching Image 3 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        {/* 1. Analyze Market Trends */}
                        <div style={infoCardStyle} className="glass-card">
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 255, 240, 0.1)', color: 'var(--color-cyan)' }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Analyze Market Trends</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Track real-time trading insights and study collectible card market movements.</p>
                            </div>
                        </div>

                        {/* 2. Join the Challenge */}
                        <div style={infoCardStyle} className="glass-card">
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(123, 44, 191, 0.15)', color: 'var(--color-purple-light)' }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                    <polyline points="16 7 22 7 22 13" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Join the Challenge</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Participate with a small entry fee and compete with other collectors.</p>
                            </div>
                        </div>

                        {/* 3. Earn Rewards */}
                        <div style={infoCardStyle} className="glass-card">
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 159, 28, 0.15)', color: 'var(--color-orange)' }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                                    <path d="M12 2a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Earn Rewards</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Top performers win bonus points, unlock new levels, and gain exclusive badges.</p>
                            </div>
                        </div>

                        {/* 4. Redeem & Upgrade */}
                        <div style={infoCardStyle} className="glass-card">
                            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 0, 127, 0.15)', color: 'var(--color-pink)' }}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '4px' }}>Redeem & Upgrade</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Use earned tokens to unlock premium features and limited-edition collectibles.</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default LeaderboardPage;