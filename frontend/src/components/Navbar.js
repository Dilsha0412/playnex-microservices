import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService, tournamentService } from '../services/api';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [usersResponse, tournamentsResponse] = await Promise.all([
                    userService.getAllUsers().catch(() => ({ data: [] })),
                    tournamentService.getAll().catch(() => ({ data: [] }))
                ]);

                if (usersResponse.data) setAllUsers(usersResponse.data);
                if (tournamentsResponse.data) setTournaments(tournamentsResponse.data);

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
        fetchInitialData();

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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
        background: 'rgba(255, 85, 0, 0.08)',
        border: '1px solid rgba(255, 85, 0, 0.2)',
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

    // Filter results based on search query
    const filteredTournaments = tournaments.filter(t => 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.game?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredUsers = allUsers.filter(u => 
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showSearchResults = isSearchOpen && searchQuery.trim().length > 0;

    return (
        <header style={headerStyle}>
            {/* Left Breadcrumbs & Page Info */}
            <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {getBreadcrumbs()}
                </span>
            </div>

            {/* Middle Search Bar */}
            <div style={searchContainerStyle} ref={searchRef}>
                <svg style={searchIconStyle} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search tournaments, players..."
                    style={searchInputStyle}
                    className="navbar-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        right: '0',
                        marginTop: '10px',
                        background: '#121212',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
                        padding: '10px 0',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        {filteredTournaments.length === 0 && filteredUsers.length === 0 && (
                            <div style={{ padding: '10px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No results found.
                            </div>
                        )}

                        {filteredTournaments.length > 0 && (
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ padding: '5px 20px', fontSize: '0.75rem', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Tournaments
                                </div>
                                {filteredTournaments.slice(0, 5).map(t => (
                                    <div 
                                        key={t.id || t._id}
                                        style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                        onClick={() => {
                                            navigate(`/bracket/${t.id || t._id}`);
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ background: 'rgba(255, 85, 0, 0.1)', padding: '5px', borderRadius: '6px' }}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--color-cyan)"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{t.title}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.game}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredUsers.length > 0 && (
                            <div>
                                <div style={{ padding: '5px 20px', fontSize: '0.75rem', color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Players
                                </div>
                                {filteredUsers.slice(0, 5).map(u => (
                                    <div 
                                        key={u._id}
                                        style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                        onClick={() => {
                                            navigate(`/leaderboard`);
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border-glass)' }} />
                                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{u.username}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right User Stats Area */}
            <div style={rightAreaStyle}>
                {/* Profile Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ position: 'relative', minWidth: '170px' }} ref={userDropdownRef}>
                        <div 
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            style={{
                                background: '#121212',
                                color: 'var(--color-cyan)',
                                border: '1px solid var(--color-cyan)',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                transition: 'var(--transition-smooth)'
                            }}
                        >
                            <span>{user ? user.username : 'Guest Mode (Viewer)'}</span>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px', transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                        
                        {isUserDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '6px',
                                background: '#0d0d0d',
                                border: '1px solid var(--border-glass-hover)',
                                borderRadius: '8px',
                                padding: '6px 0',
                                zIndex: 1000,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                minWidth: '180px',
                                maxHeight: '250px',
                                overflowY: 'auto'
                            }}>
                                <div
                                    onClick={() => {
                                        handleUserSwitch({ target: { value: '' } });
                                        setIsUserDropdownOpen(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: !user ? 'var(--color-cyan)' : 'var(--text-main)',
                                        background: !user ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                        fontWeight: !user ? '700' : '400'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = !user ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                >
                                    Guest Mode (Viewer)
                                </div>
                                {allUsers.map(u => (
                                    <div
                                        key={u._id}
                                        onClick={() => {
                                            handleUserSwitch({ target: { value: u._id } });
                                            setIsUserDropdownOpen(false);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            color: user && user._id === u._id ? 'var(--color-cyan)' : 'var(--text-main)',
                                            background: user && user._id === u._id ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                            fontWeight: user && user._id === u._id ? '700' : '400'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = user && user._id === u._id ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                    >
                                        {u.username}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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