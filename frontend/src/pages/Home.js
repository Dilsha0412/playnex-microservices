import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const Home = () => {
    const { success, error, info } = useNotification();
    const [popularLeagues, setPopularLeagues] = useState([]);
    const [upcomingList, setUpcomingList] = useState([]);

    const loadTournaments = async () => {
        try {
            const response = await tournamentService.getAll();
            const fromDb = response.data.map(t => ({
                id: t._id,
                title: t.name,
                game: t.game,
                status: t.status || 'setup',
                date: 'June 28, 2026',
                prize: '$10,000',
                competitorType: t.competitorType || 'players',
                slots: `${t.players?.length || 0}/${t.maxPlayers || 16}`,
                players: t.players?.length || 0,
                image: t.game.toLowerCase().includes('pubg') ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400' :
                       t.game.toLowerCase().includes('fifa') ? 'https://images.unsplash.com/photo-1508244751656-7c91c107b5c5?auto=format&fit=crop&q=80&w=400' : 
                       t.game.toLowerCase().includes('valorant') ? 'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=400' :
                       'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400'
            }));

            // Popular leagues: running or completed
            const popular = fromDb.filter(t => t.status === 'running' || t.status === 'completed');
            // Upcoming tournaments: setup or upcoming
            const upcoming = fromDb.filter(t => t.status === 'setup' || t.status === 'upcoming');

            setPopularLeagues(popular);
            setUpcomingList(upcoming);
        } catch (err) {
            console.error("Failed loading tournaments in Home dashboard:", err.message);
            setPopularLeagues([]);
            setUpcomingList([]);
        }
    };

    useEffect(() => {
        loadTournaments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleJoinTournament = async (t) => {
        const userId = localStorage.getItem('playnex_userId');
        if (!userId) {
            info('You are currently in Guest Mode. Please select a player profile from the top-right corner of the Navbar to join tournaments!');
            return;
        }

        try {
            // Register user to the tournament
            await tournamentService.join(t.id, userId);
            success(`🎉 Successfully joined "${t.title}"!`);
            
            // Reload
            loadTournaments();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                error(`Status: ${err.response.data.error}`);
            } else {
                console.error("Join failed:", err);
                error("Action failed. Verify that tournament-service is running.");
            }
        }
    };

    const heroBannerStyle = {
        position: 'relative',
        height: 'calc(100vh - 70px)',
        margin: '-30px -30px 40px -30px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        backgroundImage: 'url("/battle_royale_hero.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
    };

    const heroOverlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 10%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0) 100%)',
        zIndex: 1
    };

    const heroContentStyle = {
        position: 'relative',
        zIndex: 2,
        padding: '40px 40px 80px 40px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto'
    };

    const sectionTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: '800',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '10px'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
    };

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Hero Banner Area */}
            <div style={heroBannerStyle}>
                <div style={heroOverlayStyle}></div>
                
                <div style={heroContentStyle}>
                    <span style={{ 
                        background: 'var(--color-pink)', 
                        color: '#fff', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        marginBottom: '12px'
                    }}>
                        FEATURED TOURNAMENT
                    </span>
                    
                    <h1 style={{ 
                        fontSize: '3.2rem', 
                        fontWeight: '900', 
                        lineHeight: '1.1', 
                        marginBottom: '12px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        letterSpacing: '-0.5px'
                    }}>
                        BATTLE ROYALE
                    </h1>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '20px', lineHeight: '1.5' }}>
                        Join the ultimate arena shooter showdown this weekend. 100 squads drop in, only one squad takes home the crown and $15,000 prize pool.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Link to="/bracket/csgo" className="btn-primary">View Bracket</Link>
                        <Link to="/organizer" className="btn-secondary">Setup Tournament</Link>
                    </div>
                </div>
            </div>

            {/* Content Wrapper */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Popular Leagues Section */}
                <div>
                <div style={sectionTitleStyle}>
                    <span>Popular Leagues</span>
                    <Link to="/bracket/csgo" style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: '600' }}>
                        View All Leagues &rarr;
                    </Link>
                </div>

                <div style={gridStyle}>
                    {popularLeagues.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                            No active leagues found. Create or start a tournament to see it here!
                        </div>
                    ) : (
                        popularLeagues.map((league) => (
                            <div key={league.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Custom Premium Header */}
                                <div style={{
                                    height: '80px',
                                    background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.15) 0%, rgba(20, 20, 20, 0.95) 100%)',
                                    borderBottom: '1px solid var(--border-glass)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    padding: '0 16px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '15%',
                                        height: '70%',
                                        width: '4px',
                                        background: 'var(--color-cyan)',
                                        borderRadius: '0 4px 4px 0',
                                        boxShadow: '0 0 10px var(--color-cyan-glow)'
                                    }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tournament Game</span>
                                        <span style={{ 
                                            color: league.status === 'completed' ? 'var(--color-pink)' : 'var(--color-green)', 
                                            fontWeight: 'bold', 
                                            fontSize: '0.75rem', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.5px' 
                                        }}>
                                            {league.status}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        🎮 {league.game}
                                    </span>
                                </div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{league.title}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span>👥 {league.players} {league.competitorType === 'teams' ? 'Teams' : 'Players'}</span>
                                        <span className="text-cyan">💰 {league.prize}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
                                        <span>Slots Filled: {league.slots} {league.competitorType === 'teams' ? 'Teams' : 'Players'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                        <Link to={`/bracket/${league.id}`} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', textAlign: 'center' }}>Details</Link>
                                        {league.status === 'running' && (
                                            <button 
                                                className="btn-primary" 
                                                style={{ flex: 1, padding: '8px', fontSize: '0.85rem', boxShadow: 'none' }}
                                                onClick={() => handleJoinTournament(league)}
                                            >
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upcoming Tournaments Section */}
            <div>
                <div style={sectionTitleStyle}>
                    <span>Upcoming Tournaments</span>
                    <Link to="/organizer" style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: '600' }}>
                        Create Tournament &rarr;
                    </Link>
                </div>

                <div style={gridStyle}>
                    {upcomingList.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
                            No upcoming tournaments scheduled. Create a new tournament to start!
                        </div>
                    ) : (
                        upcomingList.map((t) => (
                            <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Custom Premium Header */}
                                <div style={{
                                    height: '80px',
                                    background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.15) 0%, rgba(20, 20, 20, 0.95) 100%)',
                                    borderBottom: '1px solid var(--border-glass)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    padding: '0 16px',
                                    position: 'relative',
                                    borderRadius: '12px 12px 0 0'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '15%',
                                        height: '70%',
                                        width: '4px',
                                        background: 'var(--color-cyan)',
                                        borderRadius: '0 4px 4px 0',
                                        boxShadow: '0 0 10px var(--color-cyan-glow)'
                                    }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tournament Game</span>
                                        <span className="badge badge-setup" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Registering</span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        🎮 {t.game}
                                    </span>
                                </div>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t.title}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span>📅 {t.date}</span>
                                        <span>🏆 {t.prize}</span>
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                        <Link to={`/bracket/${t.id}`} className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', textAlign: 'center' }}>Details</Link>
                                        <button 
                                            className="btn-primary" 
                                            style={{ flex: 1, padding: '8px', fontSize: '0.85rem', boxShadow: 'none' }}
                                            onClick={() => handleJoinTournament(t)}
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default Home;