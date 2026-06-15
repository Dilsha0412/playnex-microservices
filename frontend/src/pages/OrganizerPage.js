import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const OrganizerPage = () => {
    const { success, error, confirm } = useNotification();
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form states
    const [name, setName] = useState('');
    const [game, setGame] = useState('PUBG: Battlegrounds (PC)');
    const [customGame, setCustomGame] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(16);
    const [status, setStatus] = useState('setup');
    const [competitorType, setCompetitorType] = useState('players');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Dropdown Refs & Open States
    const gameDropdownRef = useRef(null);
    const maxPlayersDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const competitorTypeDropdownRef = useRef(null);

    const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
    const [isMaxPlayersDropdownOpen, setIsMaxPlayersDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isCompetitorTypeDropdownOpen, setIsCompetitorTypeDropdownOpen] = useState(false);

    const gameOptions = [
        { value: 'PUBG: Battlegrounds (PC)', label: 'PUBG: Battlegrounds (PC)' },
        { value: 'Fifa 23 (Playstation 5)', label: 'Fifa 23 (Playstation 5)' },
        { value: 'League Of Legends (PC)', label: 'League Of Legends (PC)' },
        { value: 'Counter Strike Global Offensive', label: 'Counter Strike (PC)' },
        { value: 'Other', label: 'Other' }
    ];

    const maxPlayersOptions = [
        { value: '2', label: '2 Players' },
        { value: '4', label: '4 Players' },
        { value: '8', label: '8 Players' },
        { value: '16', label: '16 Players' }
    ];

    const statusOptions = [
        { value: 'setup', label: 'Setup' },
        { value: 'running', label: 'Running' },
        { value: 'completed', label: 'Completed' }
    ];

    const competitorTypeOptions = [
        { value: 'players', label: 'Individual Players' },
        { value: 'teams', label: 'Teams' }
    ];

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
                competitorType: t.competitorType || 'players',
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
        
        const handleClickOutside = (event) => {
            if (gameDropdownRef.current && !gameDropdownRef.current.contains(event.target)) {
                setIsGameDropdownOpen(false);
            }
            if (maxPlayersDropdownRef.current && !maxPlayersDropdownRef.current.contains(event.target)) {
                setIsMaxPlayersDropdownOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
            if (competitorTypeDropdownRef.current && !competitorTypeDropdownRef.current.contains(event.target)) {
                setIsCompetitorTypeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const parsedMaxPlayers = parseInt(maxPlayers, 10);
        if (![2, 4, 8, 16].includes(parsedMaxPlayers)) {
            error('Tournament competitor limit must be 2, 4, 8, or 16.');
            return;
        }
        try {
            const payload = {
                name,
                game: game === 'Other' ? customGame : game,
                maxPlayers: parsedMaxPlayers,
                status,
                competitorType
            };
            
            if (isEditing) {
                // Call backend update
                await tournamentService.update(editingId, payload);
                success('Tournament updated successfully!');
            } else {
                await tournamentService.create(payload);
                success('Tournament created successfully!');
            }
            
            // Reset & Close
            setName('');
            setGame('PUBG: Battlegrounds (PC)');
            setCustomGame('');
            setIsEditing(false);
            setEditingId(null);
            setShowModal(false);
            fetchTournaments();
        } catch (err) {
            error('Action failed: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    const handleEditClick = (t) => {
        setIsEditing(true);
        setEditingId(t.id);
        setName(t.name);

        const predefinedGames = [
            'PUBG: Battlegrounds (PC)',
            'Fifa 23 (Playstation 5)',
            'League Of Legends (PC)',
            'Counter Strike Global Offensive'
        ];

        if (predefinedGames.includes(t.game)) {
            setGame(t.game);
            setCustomGame('');
        } else {
            setGame('Other');
            setCustomGame(t.game);
        }

        setMaxPlayers(t.maxPlayers || 16);
        setStatus(t.status || 'setup');
        setCompetitorType(t.competitorType || 'players');
        setShowModal(true);
    };

    const handleDeleteClick = async (t) => {
        const isConfirmed = await confirm(
            `Are you sure you want to permanently delete the tournament "${t.name}"?`,
            'Delete Tournament',
            { confirmText: 'Delete', type: 'danger' }
        );
        if (isConfirmed) {
            try {
                await tournamentService.delete(t.id);
                success('Tournament deleted successfully!');
                if (localStorage.getItem('playnex_last_tournament') === t.id) {
                    localStorage.removeItem('playnex_last_tournament');
                }
                fetchTournaments();
            } catch (err) {
                error('Delete failed: ' + (err.response?.data?.error || err.message));
                console.error(err);
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
                        setCustomGame('');
                        setStatus('setup');
                        setCompetitorType('players');
                        setShowModal(true);
                    }} 
                    style={{ background: 'linear-gradient(to right, #ff5500, #ff7f00)' }}
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
                    background: 'rgba(0, 0, 0, 0.85)',
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
                        border: '1px solid rgba(255, 85, 0, 0.2)',
                        boxShadow: '0 0 30px rgba(255, 85, 0, 0.1)'
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

                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px', color: '#ffffff' }}>
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

                            <div className="form-group" style={{ position: 'relative' }} ref={gameDropdownRef}>
                                <label className="form-label">Game & Platform</label>
                                <div 
                                    onClick={() => setIsGameDropdownOpen(!isGameDropdownOpen)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(0, 0, 0, 0.6)',
                                        border: isGameDropdownOpen ? '1px solid var(--color-cyan)' : '1px solid var(--border-glass)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: isGameDropdownOpen ? '0 0 8px var(--color-cyan-glow)' : 'none',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    <span>{gameOptions.find(o => o.value === game)?.label || game}</span>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isGameDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                {isGameDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        marginTop: '6px',
                                        background: '#0d0d0d',
                                        border: '1px solid var(--border-glass-hover)',
                                        borderRadius: '8px',
                                        padding: '6px 0',
                                        zIndex: 1000,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {gameOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    setGame(opt.value);
                                                    setIsGameDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '10px 16px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.95rem',
                                                    color: game === opt.value ? 'var(--color-cyan)' : 'var(--text-main)',
                                                    background: game === opt.value ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                                    fontWeight: game === opt.value ? '700' : '400',
                                                    transition: 'var(--transition-smooth)'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = game === opt.value ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {game === 'Other' && (
                                <div className="form-group" style={{ marginTop: '15px', marginBottom: '15px' }}>
                                    <label className="form-label">Specify Game & Platform</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="e.g. Valorant (PC)" 
                                        required 
                                        value={customGame}
                                        onChange={(e) => setCustomGame(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Competitor Type Dropdown */}
                            <div className="form-group" style={{ position: 'relative' }} ref={competitorTypeDropdownRef}>
                                <label className="form-label">Competitor Type</label>
                                <div 
                                    onClick={() => setIsCompetitorTypeDropdownOpen(!isCompetitorTypeDropdownOpen)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(0, 0, 0, 0.6)',
                                        border: isCompetitorTypeDropdownOpen ? '1px solid var(--color-cyan)' : '1px solid var(--border-glass)',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        color: 'var(--text-main)',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: isCompetitorTypeDropdownOpen ? '0 0 8px var(--color-cyan-glow)' : 'none',
                                        transition: 'var(--transition-smooth)'
                                    }}
                                >
                                    <span>{competitorTypeOptions.find(o => o.value === competitorType)?.label || competitorType}</span>
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isCompetitorTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                {isCompetitorTypeDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        marginTop: '6px',
                                        background: '#0d0d0d',
                                        border: '1px solid var(--border-glass-hover)',
                                        borderRadius: '8px',
                                        padding: '6px 0',
                                        zIndex: 1000,
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {competitorTypeOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    setCompetitorType(opt.value);
                                                    setIsCompetitorTypeDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '10px 16px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.95rem',
                                                    color: competitorType === opt.value ? 'var(--color-cyan)' : 'var(--text-main)',
                                                    background: competitorType === opt.value ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                                    fontWeight: competitorType === opt.value ? '700' : '400',
                                                    transition: 'var(--transition-smooth)'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = competitorType === opt.value ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group" style={{ position: 'relative' }} ref={maxPlayersDropdownRef}>
                                    <label className="form-label">{competitorType === 'teams' ? 'Max Teams' : 'Max Competitors'}</label>
                                    <div 
                                        onClick={() => setIsMaxPlayersDropdownOpen(!isMaxPlayersDropdownOpen)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            border: isMaxPlayersDropdownOpen ? '1px solid var(--color-cyan)' : '1px solid var(--border-glass)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            color: 'var(--text-main)',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            boxShadow: isMaxPlayersDropdownOpen ? '0 0 8px var(--color-cyan-glow)' : 'none',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        <span>{maxPlayersOptions.find(o => String(o.value) === String(maxPlayers))?.label.replace('Players', competitorType === 'teams' ? 'Teams' : 'Players') || `${maxPlayers} ${competitorType === 'teams' ? 'Teams' : 'Players'}`}</span>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isMaxPlayersDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                    {isMaxPlayersDropdownOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            marginTop: '6px',
                                            background: '#0d0d0d',
                                            border: '1px solid var(--border-glass-hover)',
                                            borderRadius: '8px',
                                            padding: '6px 0',
                                            zIndex: 1000,
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            {maxPlayersOptions.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setMaxPlayers(opt.value);
                                                        setIsMaxPlayersDropdownOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.95rem',
                                                        color: String(maxPlayers) === String(opt.value) ? 'var(--color-cyan)' : 'var(--text-main)',
                                                        background: String(maxPlayers) === String(opt.value) ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                                        fontWeight: String(maxPlayers) === String(opt.value) ? '700' : '400',
                                                        transition: 'var(--transition-smooth)'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = String(maxPlayers) === String(opt.value) ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                                >
                                                    {opt.label.replace('Players', competitorType === 'teams' ? 'Teams' : 'Players')}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group" style={{ position: 'relative' }} ref={statusDropdownRef}>
                                    <label className="form-label">Initial Status</label>
                                    <div 
                                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            border: isStatusDropdownOpen ? '1px solid var(--color-cyan)' : '1px solid var(--border-glass)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            color: 'var(--text-main)',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            boxShadow: isStatusDropdownOpen ? '0 0 8px var(--color-cyan-glow)' : 'none',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        <span>{statusOptions.find(o => o.value === status)?.label || status}</span>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                    {isStatusDropdownOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            marginTop: '6px',
                                            background: '#0d0d0d',
                                            border: '1px solid var(--border-glass-hover)',
                                            borderRadius: '8px',
                                            padding: '6px 0',
                                            zIndex: 1000,
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            {statusOptions.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setStatus(opt.value);
                                                        setIsStatusDropdownOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.95rem',
                                                        color: status === opt.value ? 'var(--color-cyan)' : 'var(--text-main)',
                                                        background: status === opt.value ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                                        fontWeight: status === opt.value ? '700' : '400',
                                                        transition: 'var(--transition-smooth)'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = status === opt.value ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
