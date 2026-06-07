import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const navStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px 30px',
        background: '#1a1a2e',
        color: '#fff',
        alignItems: 'center'
    };

    const linkStyle = {
        color: '#00fff0',
        margin: '0 15px',
        textDecoration: 'none',
        fontWeight: 'bold'
    };

    return (
        <nav style={navStyle}>
            <h2>PlayNex Gaming</h2>
            <div>
                <Link to="/" style={linkStyle}>Home</Link>
                <Link to="/tournaments" style={linkStyle}>Tournaments</Link>
                <Link to="/leaderboard" style={linkStyle}>Leaderboard</Link>
            </div>
        </nav>
    );
};

export default Navbar;