import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            path: '/home',
            name: 'Home',
            icon: (
                <svg className="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            )
        },
        {
            path: '/bracket/csgo',
            name: 'Tournaments',
            icon: (
                <svg className="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            )
        },
        {
            path: '/organizer',
            name: 'Organizer',
            icon: (
                <svg className="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                </svg>
            )
        },
        {
            path: '/leaderboard',
            name: 'Leaderboard',
            icon: (
                <svg className="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            )
        },
        {
            path: '/register',
            name: 'Register Player',
            icon: (
                <svg className="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
            )
        },
        {
            path: '/external-game',
            name: 'Play External Game',
            icon: (
                <svg className="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-6.13 6.13a1 1 0 0 1-1.41-1.41l6.13-6.13a6 6 0 0 1 9.36-7.94l-3.77 3.77a1 1 0 0 0 0 1.4z"></path>
                </svg>
            )
        }
    ];

    const sidebarStyle = {
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between'
    };

    const logoAreaStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 8px 30px 8px',
        borderBottom: '1px solid var(--border-glass)'
    };

    const logoIconStyle = {
        background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-purple) 100%)',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#fff',
        fontSize: '1.2rem'
    };

    const logoTextStyle = {
        fontSize: '1.3rem',
        fontWeight: '800',
        letterSpacing: '0.5px',
        color: '#ffffff'
    };

    const menuListStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginTop: '25px',
        listStyle: 'none'
    };

    const getLinkStyle = (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '10px',
        color: isActive ? 'var(--color-cyan)' : 'var(--text-muted)',
        textDecoration: 'none',
        fontWeight: isActive ? '600' : '500',
        fontSize: '0.95rem',
        background: isActive ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent',
        transition: 'var(--transition-smooth)'
    });

    const footerStyle = {
        borderTop: '1px solid var(--border-glass)',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    };

    const footerLinkStyle = {
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        textDecoration: 'none',
        padding: '6px 8px',
        borderRadius: '6px',
        transition: 'var(--transition-smooth)'
    };

    return (
        <div style={sidebarStyle}>
            <div>
                {/* Logo Section */}
                <div style={logoAreaStyle}>
                    <div style={logoIconStyle}>P</div>
                    <span style={logoTextStyle}>PLAYNEX</span>
                </div>

                {/* Main Navigation Links */}
                <ul style={menuListStyle}>
                    {menuItems.map((item) => {
                        const isActive = item.path.startsWith('/bracket')
                            ? location.pathname.startsWith('/bracket')
                            : (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
                        return (
                            <li key={item.name}>
                                <Link to={item.path} style={getLinkStyle(isActive)} className="sidebar-link">
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Bottom Meta Links */}
            <div style={footerStyle}>
                <button 
                    onClick={() => {
                        localStorage.removeItem('playnex_userId');
                        window.location.href = '/';
                    }} 
                    style={{
                        ...footerLinkStyle,
                        background: 'rgba(255, 85, 0, 0.1)',
                        color: 'var(--color-cyan)',
                        border: '1px solid var(--color-cyan)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }} 
                    className="sidebar-link"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
