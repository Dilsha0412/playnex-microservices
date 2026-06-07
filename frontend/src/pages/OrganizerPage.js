import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../services/api';

const OrganizerPage = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form states
    const [name, setName] = useState('');
    const [game, setGame] = useState('PUBG: Battlegrounds (PC)');
    const [maxPlayers, setMaxPlayers] = useState(16);
    const [status, setStatus] = useState('setup');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const response = await tournamentService.getAll();
            const backendList = response.data.map(t => ({
                id: t._id,
                name: t.name,
                game: t.game,
                status: t.status || 'upcoming',
                maxPlayers: t.maxPlayers || 16,
                date: 'Just now',
                mode: 'Online',
                iconColor: t.game.toLowerCase().includes('pubg') ? '#ffd166' : 
                           t.game.toLowerCase().includes('fifa') ? '#ef476f' : 
                           t.game.toLowerCase().includes('valorant') ? '#00f5d4' : '#118ab2'
            }));
            
            setTournaments(backendList);
        } catch (error) {
            console.error("Failed fetching tournaments:", error);
            setTournaments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name,
                game,
                maxPlayers: parseInt(maxPlayers),
                status
            };
            
            if (isEditing) {
                // Call backend update
                await tournamentService.update(editingId, payload);
                alert('Tournament updated successfully!');
            } else {
                await tournamentService.create(payload);
                alert('Tournament created successfully!');
            }
            
            // Reset & Close
            setName('');
            setIsEditing(false);
            setEditingId(null);
            setShowModal(false);
            fetchTournaments();
        } catch (error) {
            alert('Action failed: ' + (error.response?.data?.error || error.message));
            console.error(error);
        }
    };

    const handleEditClick = (t) => {
        setIsEditing(true);
        setEditingId(t.id);
        setName(t.name);
        setGame(t.game);
        setMaxPlayers(t.maxPlayers || 16);
        setStatus(t.status || 'setup');
        setShowModal(true);
    };

    const handleDeleteClick = async (t) => {
        if (window.confirm(`Are you sure you want to permanently delete the tournament "${t.name}"?`)) {
            try {
                await tournamentService.delete(t.id);
                alert('Tournament deleted successfully!');
                fetchTournaments();
            } catch (error) {
                alert('Delete failed: ' + (error.response?.data?.error || error.message));
                console.error(error);
            }
        }
    };

    // Filters
    const filteredTournaments = tournaments.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.game.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getGameIconSvg = (gameName) => {
        if (gameName.includes('PUBG')) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/>
                    <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
            );
        }
        if (gameName.includes('Fifa')) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    <path d="M2 12h20"/>
                </svg>
            );
        }
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
        );
    };

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>My platform</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Create, manage, and configure your gaming tournaments</p>
                </div>
                <button 
                    onClick={() => {
                        setIsEditing(false);
                        setEditingId(null);
                        setName('');
                        setGame('PUBG: Battlegrounds (PC)');
                        setStatus('setup');
                        setShowModal(true);
                    }} 
                    style={{ background: 'linear-gradient(to right, #2ec4b6, #00f5d4)' }}
                    className="btn-success"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Create tournament
                </button>
            </div>

            {/* Filter Panel */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Filter by tournament name or game..." 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-glass)', color: '#fff' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['all', 'setup', 'running', 'completed'].map((statusOption) => (
                        <button
                            key={statusOption}
                            onClick={() => setStatusFilter(statusOption)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-glass)',
                                background: statusFilter === statusOption ? 'var(--color-cyan)' : 'var(--bg-card)',
                                color: statusFilter === statusOption ? '#0c0822' : 'var(--text-main)',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                                transition: 'var(--transition-smooth)'
                            }}
                        >
                            {statusOption}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tournaments Grid */}
            <div className="glass-panel" style={{ padding: '10px', overflowX: 'auto' }}>
                {loading && tournaments.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tournaments from DB...</div>
                ) : (
                    <table className="game-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}></th>
                                <th>Tournament Info</th>
                                <th>Schedule</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTournaments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                        No tournaments found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredTournaments.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ 
                                                width: '42px', 
                                                height: '42px', 
                                                borderRadius: '10px', 
                                                background: t.iconColor, 
                                                color: '#0c0822',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center' 
                                            }}>
                                                {getGameIconSvg(t.game)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{t.name}</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.game}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{t.date}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.mode}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${t.status}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '10px' }}>
                                                <button 
                                                    className="btn-secondary" 
                                                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                                    onClick={() => handleEditClick(t)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ padding: '6px 12px', fontSize: '0.85rem', boxShadow: 'none' }}
                                                    onClick={() => navigate(`/bracket/${t.id}`)}
                                                >
                                                    Manage
                                                </button>
                                                <button 
                                                    className="btn-danger" 
                                                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                                    onClick={() => handleDeleteClick(t)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Dialog Form for Creating Tournament */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(6, 4, 18, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="glass-panel" style={{
                        width: '500px',
                        padding: '30px',
                        position: 'relative',
                        border: '1px solid rgba(0, 255, 240, 0.2)',
                        boxShadow: '0 0 30px rgba(0, 255, 240, 0.1)'
                    }}>
                        {/* Close button */}
                        <button 
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            &times;
                        </button>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px', background: 'linear-gradient(to right, #fff, var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {isEditing ? 'Edit Tournament' : 'Create New Tournament'}
                        </h2>

                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label className="form-label">Tournament Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. Battle Drop #3" 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Game & Platform</label>
                                <select 
                                    className="form-input"
                                    value={game}
                                    onChange={(e) => setGame(e.target.value)}
                                >
                                    <option value="PUBG: Battlegrounds (PC)">PUBG: Battlegrounds (PC)</option>
                                    <option value="Fifa 23 (Playstation 5)">Fifa 23 (Playstation 5)</option>
                                    <option value="League Of Legends (PC)">League Of Legends (PC)</option>
                                    <option value="Counter Strike Global Offensive">Counter Strike (PC)</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Max Competitors</label>
                                    <input 
                                        type="number" 
                                        className="form-input"
                                        min="2"
                                        max="128"
                                        value={maxPlayers}
                                        onChange={(e) => setMaxPlayers(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Initial Status</label>
                                    <select 
                                        className="form-input"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="setup">Setup</option>
                                        <option value="running">Running</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Save Changes' : 'Create Tournament'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerPage;
