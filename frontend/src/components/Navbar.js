import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { userService } from '../services/api';

const Navbar = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchActiveUser = async () => {
            try {
                const usersResponse = await userService.getAllUsers();
                if (usersResponse.data) {
                    setAllUsers(usersResponse.data);
                }

                const userId = localStorage.getItem('playnex_userId');
                if (userId) {
                    const response = await userService.getProfile(userId);
                    if (response.data) {
                        setUser(response.data);
                    }
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Failed to fetch active user/all users in Navbar:", err.message);
            }
        };
        fetchActiveUser();
    }, []);

    const handleUserSwitch = (e) => {
        const newUserId = e.target.value;
        if (!newUserId) {
            localStorage.removeItem('playnex_userId');
        } else {
            localStorage.setItem('playnex_userId', newUserId);
        }
        window.location.reload(); // Reload to refresh all components with new user
    };

    // Generate readable page title breadcrumb based on route
    const getBreadcrumbs = () => {
        const path = location.pathname;
        if (path === '/') return 'Home > Dashboard';
        if (path.startsWith('/organizer')) return 'Platform > Organizer';
        if (path.startsWith('/leaderboard')) return 'Platform > Global Leaderboard';
        if (path.startsWith('/bracket')) return 'Tournaments > CS:GO > Bracket';
        return 'PlayNex > Dashboard';
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 30px',
        height: '100%',
        width: '100%',
    };

    const searchContainerStyle = {
        position: 'relative',
        width: '320px',
    };

    const searchInputStyle = {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border-glass)',
        borderRadius: '20px',
        padding: '8px 16px 8px 36px',
        color: '#fff',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'var(--transition-smooth)'
    };

    const searchIconStyle = {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)'
    };

    const rightAreaStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
    };

    const pointsBadgeStyle = {
        background: 'rgba(0, 255, 240, 0.08)',
        border: '1px solid rgba(0, 255, 240, 0.2)',
        borderRadius: '12px',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        fontWeight: '600'
    };

    const avatarAreaStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer'
    };

    const avatarImageStyle = {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '2px solid var(--color-cyan)',
        objectFit: 'cover'
    };

    const userInfoStyle = {
        display: 'flex',
        flexDirection: 'column'
    };

    const userNameStyle = {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#fff'
    };

    const userStatusStyle = {
        fontSize: '0.75rem',
        color: 'var(--color-cyan)',
        fontWeight: 'bold'
    };

    return (
        <header style={headerStyle}>
            {/* Left Breadcrumbs & Page Info */}
            <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {getBreadcrumbs()}
                </span>
            </div>

            {/* Middle Search Bar */}
            <div style={searchContainerStyle}>
                <svg style={searchIconStyle} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search tournaments, players, matches..."
                    style={searchInputStyle}
                    className="navbar-search"
                />
            </div>

            {/* Right User Stats Area */}
            <div style={rightAreaStyle}>
                {/* Balance & Points */}
                <div style={pointsBadgeStyle}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none" className="text-cyan">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12M6 12h12" />
                    </svg>
                    <span>29,921 LINCS</span>
                </div>

                {/* Notification Bell */}
                <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        background: 'var(--color-pink)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%'
                    }}></span>
                </button>

                {/* Profile Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <select 
                        value={user ? user._id : ''} 
                        onChange={handleUserSwitch}
                        style={{
                            background: '#1A162B',
                            color: '#00fff0',
                            border: '1px solid #00fff0',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">Guest Mode (Viewer)</option>
                        {allUsers.map(u => (
                            <option key={u._id} value={u._id} style={{ background: '#1A162B', color: '#fff' }}>
                                {u.username}
                            </option>
                        ))}
                    </select>

                    <div style={avatarAreaStyle}>
                        <img
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user ? user.username : 'Guest'}`}
                            alt="User Avatar"
                            style={avatarImageStyle}
                        />
                        <div style={userInfoStyle} className="hidden-mobile">
                            <span style={userNameStyle}>{user ? user.username : 'Guest'}</span>
                            <span style={userStatusStyle}>
                                {user ? (user.username === 'Dilsha Jayasekara' || user.username === 'Elife Yeon' ? 'Legendary Trainer' : 'Challenger') : 'Guest Mode'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;