import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const containerStyle = {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#04020f', // Extra deep dark space background
        color: '#ffffff',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0'
    };

    // Huge Display Typography Background (Distorted / Stretched / Custom Positions)
    const bgTextStyle = {
        position: 'absolute',
        fontWeight: '900',
        color: '#5b2fbc', // Sleek violet/purple color
        opacity: '0.22', // Subtle background integration
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        letterSpacing: '-0.06em',
        textTransform: 'uppercase',
        transition: 'all 0.5s ease'
    };

    const bgTopStyle = {
        ...bgTextStyle,
        top: '-2vw',
        left: '50%',
        transform: 'translateX(-50%) scale(1.1, 1.45)',
        fontSize: '15vw',
        lineHeight: '0.8',
    };

    const bgBottomStyle = {
        ...bgTextStyle,
        bottom: '-2.5vw',
        left: '50%',
        transform: 'translateX(-50%) scale(1.15, 1.55)',
        fontSize: '11vw',
        lineHeight: '0.8',
    };

    const bgLeftStyle = {
        ...bgTextStyle,
        left: '-5.5vw',
        top: '52%',
        transform: 'translateY(-50%) rotate(-90deg) scale(1.1, 1.35)',
        fontSize: '8vw',
        transformOrigin: 'center center',
    };

    const bgRightStyle = {
        ...bgTextStyle,
        right: '-5.5vw',
        top: '52%',
        transform: 'translateY(-50%) rotate(90deg) scale(1.1, 1.35)',
        fontSize: '8vw',
        transformOrigin: 'center center',
    };

    // Header Navigation Style
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '28px 48px',
        width: '100%',
        zIndex: '10',
        backdropFilter: 'blur(4px)',
    };

    const logoStyle = {
        fontSize: '1.5rem',
        fontWeight: '900',
        letterSpacing: '0.5px',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const logoIconStyle = {
        background: 'linear-gradient(135deg, #00fff0 0%, #7b2cbf 100%)',
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        color: '#fff'
    };

    const navMenuStyle = {
        display: 'flex',
        gap: '32px',
        listStyle: 'none',
        alignItems: 'center'
    };

    const navLinkStyle = {
        color: 'rgba(255, 255, 255, 0.7)',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
    };

    const rightNavStyle = {
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
    };

    // Main Center Content Style
    const heroContentStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexGrow: '1',
        zIndex: '10',
        padding: '0 24px',
        marginTop: '-40px'
    };

    const headlineStyle = {
        fontSize: '2.5rem',
        fontWeight: '800',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        color: '#ffffff',
        marginBottom: '28px',
        maxWidth: '850px',
        lineHeight: '1.2'
    };

    const ctaContainerStyle = {
        display: 'flex',
        gap: '16px',
        alignItems: 'center'
    };

    const ctaStartStyle = {
        background: '#ffffff',
        color: '#060412',
        border: 'none',
        borderRadius: '30px',
        padding: '14px 32px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 25px rgba(255, 255, 255, 0.15)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    };

    const ctaConsoleStyle = {
        background: 'transparent',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '30px',
        padding: '14px 32px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    };

    return (
        <div style={containerStyle}>
            {/* Massive Displays Stretched Background Typography */}
            <div style={bgTopStyle}>PLAYNEX</div>
            <div style={bgLeftStyle}>YOUR BATTLES</div>
            <div style={bgRightStyle}>YOUR GLORY</div>
            <div style={bgBottomStyle}>YOURS TO CONQUER</div>

            {/* Glowing blur effects behind center container */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(123, 44, 191, 0.3) 0%, rgba(0, 255, 240, 0.05) 50%, rgba(0,0,0,0) 70%)',
                zIndex: '1',
                pointerEvents: 'none',
                filter: 'blur(30px)'
            }}></div>

            {/* Navigation Header */}
            <header style={headerStyle}>
                <div style={logoStyle} onClick={() => navigate('/home')}>
                    <div style={logoIconStyle}>P</div>
                    <span style={{ fontWeight: '800' }}>PLAYNEX</span>
                </div>

                <ul style={navMenuStyle} className="hidden-mobile">
                    <li><span style={navLinkStyle} onClick={() => navigate('/home')} className="nav-hover-link">Platform</span></li>
                    <li><span style={navLinkStyle} onClick={() => navigate('/bracket/csgo')} className="nav-hover-link">Tournaments</span></li>
                    <li><span style={navLinkStyle} onClick={() => navigate('/leaderboard')} className="nav-hover-link">Leaderboards</span></li>
                    <li><span style={navLinkStyle} onClick={() => navigate('/organizer')} className="nav-hover-link">Organizer</span></li>
                    <li><a href="mailto:support@playnex.com" style={navLinkStyle} className="nav-hover-link">Support</a></li>
                </ul>

                <div style={rightNavStyle}>
                    <button 
                        onClick={() => navigate('/home')}
                        style={{
                            background: 'transparent',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        className="btn-hover-glow"
                    >
                        Tutorial
                    </button>
                    <button 
                        onClick={() => navigate('/register')}
                        style={{
                            background: '#ffffff',
                            color: '#060412',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255,255,255,0.1)',
                            transition: 'all 0.2s'
                        }}
                        className="btn-hover-solid"
                    >
                        Log In
                    </button>
                </div>
            </header>

            {/* Hero Main Content */}
            <section style={heroContentStyle}>
                <h1 style={headlineStyle}>
                    THE PLAYER-FIRST<br />
                    COMPETITIVE GAMING PLATFORM
                </h1>
                
                <div style={ctaContainerStyle}>
                    <button 
                        style={ctaStartStyle} 
                        onClick={() => navigate('/home')}
                        className="btn-cta-white"
                    >
                        Start now
                    </button>
                    <button 
                        style={ctaConsoleStyle} 
                        onClick={() => navigate('/organizer')}
                        className="btn-cta-outline"
                    >
                        Organizer console
                    </button>
                </div>
            </section>

            {/* Empty footer area to align content perfectly like the mock */}
            <div style={{ height: '80px', width: '100%' }}></div>
        </div>
    );
};

export default LandingPage;
