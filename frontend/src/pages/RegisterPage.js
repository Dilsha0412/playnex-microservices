import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const RegisterPage = () => {
    const { success, error, confirm } = useNotification();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Session states (synchronized with localStorage)
    const [activePlayerId, setActivePlayerId] = useState(localStorage.getItem('playnex_userId') || '');
    const [activeOpponentId, setActiveOpponentId] = useState(localStorage.getItem('playnex_opponentId') || '');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            setUsers(response.data || []);
        } catch (err) {
            console.error("Failed fetching users:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const payload = { username, email, password };
            await userService.register(payload);
            success(`🎉 Player "${username}" registered successfully!`);
            
            // Reset form
            setUsername('');
            setEmail('');
            setPassword('');
            
            // Refresh list
            fetchUsers();
        } catch (err) {
            error('Registration failed: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    const handleSetActivePlayer = (id, name) => {
        if (id === activeOpponentId) {
            error("This player is already set as the Active Opponent. Choose another player or swap them.");
            return;
        }
        localStorage.setItem('playnex_userId', id);
        setActivePlayerId(id);
        success(`👤 "${name}" has been set as the Active Player.`);
        // Reload slightly later to let user read the toast
        setTimeout(() => {
            window.location.reload();
        }, 1200);
    };

    const handleSetActiveOpponent = (id, name) => {
        if (id === activePlayerId) {
            error("This player is already set as the Active Player. Choose another player or swap them.");
            return;
        }
        localStorage.setItem('playnex_opponentId', id);
        setActiveOpponentId(id);
        success(`👤 "${name}" has been set as the Active Opponent.`);
        // Reload slightly later to let user read the toast
        setTimeout(() => {
            window.location.reload();
        }, 1200);
    };

    const handleDeleteUser = async (id, name) => {
        if (id === activePlayerId || id === activeOpponentId) {
            error(`Cannot delete player "${name}" because they are currently set as the Active Player or Active Opponent in the active session.`);
            return;
        }
        const isConfirmed = await confirm(
            `Are you sure you want to permanently delete player "${name}"?`,
            'Delete Player',
            { confirmText: 'Delete', type: 'danger' }
        );
        if (!isConfirmed) {
            return;
        }
        try {
            await userService.deleteUser(id);
            if (name === 'Dilsha Jayasekara' || name === 'Elife Yeon') {
                localStorage.setItem(`playnex_deleted_default_${name}`, 'true');
            }
            success(`🗑️ Player "${name}" deleted successfully.`);
            fetchUsers();
        } catch (err) {
            error('Delete failed: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '6px' }}>Player Registration</h1>
                <p style={{ color: 'var(--text-muted)' }}>Register new real-world players and manage active competitive sessions</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px', alignItems: 'start' }}>
                
                {/* Left: Registration Form */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', color: '#ffffff' }}>
                        Create Player Account
                    </h2>
                    
                    <form onSubmit={handleRegister} autoComplete="off">
                        <div className="form-group">
                            <label className="form-label">Player Name / Nickname</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="e.g. Kasun Perera" 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="new-username"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input 
                                type="email" 
                                className="form-input" 
                                placeholder="e.g. kasun@gmail.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="new-email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="••••••••" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                            Register Player
                        </button>
                    </form>
                </div>

                {/* Right: Players List & Switcher */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px', color: '#ffffff' }}>
                        All Registered Players & Session Management
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading players...</div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No players registered yet. Create one on the left.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {users.map((user) => {
                                const isActivePlayer = user._id === activePlayerId;
                                const isActiveOpponent = user._id === activeOpponentId;
                                const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`;
                                
                                return (
                                    <div 
                                        key={user._id} 
                                        style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '16px', 
                                            background: 'var(--bg-card)', 
                                            border: isActivePlayer ? '1px solid var(--color-cyan)' : isActiveOpponent ? '1px solid var(--color-pink)' : '1px solid var(--border-glass)',
                                            borderRadius: '12px',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        {/* Player Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img 
                                                src={avatarUrl} 
                                                alt={user.username} 
                                                style={{ 
                                                    width: '42px', 
                                                    height: '42px', 
                                                    borderRadius: '50%', 
                                                    border: isActivePlayer ? '2px solid var(--color-cyan)' : isActiveOpponent ? '2px solid var(--color-pink)' : '1px solid var(--border-glass)' 
                                                }} 
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>{user.username}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                                    {isActivePlayer && (
                                                        <span className="badge badge-running" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Active Player</span>
                                                    )}
                                                    {isActiveOpponent && (
                                                        <span className="badge" style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255, 0, 127, 0.15)', color: 'var(--color-pink)', border: '1px solid rgba(255, 0, 127, 0.3)' }}>Active Opponent</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Switch Actions */}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '0.8rem', 
                                                    borderColor: isActivePlayer ? 'var(--color-cyan)' : 'var(--border-glass-hover)',
                                                    color: isActivePlayer ? 'var(--color-cyan)' : 'var(--text-main)',
                                                    cursor: isActivePlayer ? 'default' : 'pointer'
                                                }}
                                                disabled={isActivePlayer}
                                                onClick={() => handleSetActivePlayer(user._id, user.username)}
                                            >
                                                Use as Player
                                            </button>
                                            <button 
                                                className="btn-danger" 
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '0.8rem', 
                                                    borderColor: isActiveOpponent ? 'var(--color-pink)' : 'var(--border-glass-hover)',
                                                    color: isActiveOpponent ? 'var(--color-pink)' : 'var(--text-main)',
                                                    cursor: isActiveOpponent ? 'default' : 'pointer'
                                                }}
                                                disabled={isActiveOpponent}
                                                onClick={() => handleSetActiveOpponent(user._id, user.username)}
                                            >
                                                Use as Opponent
                                            </button>
                                            <button 
                                                className="btn-danger" 
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '0.8rem', 
                                                    background: 'rgba(255, 60, 0, 0.1)',
                                                    borderColor: 'rgba(255, 60, 0, 0.3)',
                                                    color: 'var(--color-pink)',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleDeleteUser(user._id, user.username)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
