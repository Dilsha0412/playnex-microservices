import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ──────────────────────────── FAQ Data ──────────────────────────── */
const FAQ_ITEMS = [
    {
        q: 'How do I create a tournament?',
        a: 'Navigate to the Organizer page from the sidebar, click "Create Tournament", fill in the details (game, format, max players) and hit submit. Your tournament will be live immediately.'
    },
    {
        q: 'Is PlayNex free to use?',
        a: 'Yes! PlayNex is completely free for players and organizers. We believe competitive gaming should be accessible to everyone.'
    },
    {
        q: 'How does the matchmaking system work?',
        a: 'Our matchmaking pairs players based on skill rating (ELO), recent performance, and regional latency to ensure fair and competitive matches every time.'
    },
    {
        q: 'Which games are supported?',
        a: 'PlayNex currently supports CS:GO, Valorant, League of Legends, Dota 2, and Fortnite — with more titles being added regularly.'
    },
    {
        q: 'How do I report a bug or cheater?',
        a: 'Use the contact form below or email us directly at support@playnex.com. For cheater reports, include the match ID and any evidence you have.'
    },
    {
        q: 'Can I organize private tournaments?',
        a: 'Absolutely. When creating a tournament you can set it to "Invite Only" and share a unique join code with your friends or community.'
    }
];

/* ────────────────────────── Quick-Link Data ─────────────────────── */
const QUICK_LINKS = [
    { icon: '📖', title: 'Getting Started', desc: 'New to PlayNex? Learn the basics.', path: '/register' },
    { icon: '🎮', title: 'Game Guides', desc: 'Tips, rules & supported titles.', path: '/home' },
    { icon: '🛡️', title: 'Account & Security', desc: 'Manage your profile safely.', path: '/register' },
    { icon: '🏆', title: 'Tournaments Help', desc: 'Creating & joining tournaments.', path: '/bracket/csgo' },
];

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */
const LandingPage = () => {
    const navigate = useNavigate();

    /* ── Support panel state ── */
    const [supportOpen, setSupportOpen] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [formStatus, setFormStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

    const toggleSupport = useCallback(() => setSupportOpen(prev => !prev), []);
    const toggleFaq = useCallback((i) => setExpandedFaq(prev => (prev === i ? null : i)), []);

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;
        setFormStatus('sending');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('sent');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setFormStatus(null), 4000);
        }, 1200);
    };

    /* ────────────────────── Inline Styles ────────────────────── */
    const containerStyle = {
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.8) 100%), url("/landing_hero.png") center/cover no-repeat',
        color: '#ffffff',
        fontFamily: "var(--font-family)",
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
        color: '#ff5500', // Sleek orange color
        opacity: '0.03', // Subtle background integration
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
        zIndex: '20',
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
        background: 'linear-gradient(135deg, #ff5500 0%, #ff8800 100%)',
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
        background: 'var(--color-cyan)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '30px',
        padding: '14px 32px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 25px rgba(255, 85, 0, 0.25)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    };

    /* ── Support Panel Styles ── */
    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 90,
        opacity: supportOpen ? 1 : 0,
        pointerEvents: supportOpen ? 'auto' : 'none',
        transition: 'opacity 0.35s ease',
    };

    const panelStyle = {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '520px',
        maxWidth: '92vw',
        height: '100vh',
        zIndex: 100,
        background: 'linear-gradient(165deg, rgba(18,18,22,0.97) 0%, rgba(10,10,14,0.99) 100%)',
        borderLeft: '1px solid rgba(255,85,0,0.15)',
        boxShadow: supportOpen ? '-8px 0 60px rgba(0,0,0,0.7), -2px 0 20px rgba(255,85,0,0.08)' : 'none',
        transform: supportOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    };

    const panelHeaderStyle = {
        padding: '28px 32px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
    };

    const panelBodyStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px 40px',
    };

    const closeBtnStyle = {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.1rem',
        transition: 'all 0.2s ease',
    };

    const sectionTitleStyle = {
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#ff5500',
        marginBottom: '16px',
        marginTop: '28px',
    };

    const faqItemStyle = (isOpen) => ({
        background: isOpen ? 'rgba(255,85,0,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isOpen ? 'rgba(255,85,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '12px',
        marginBottom: '10px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
    });

    const faqQStyle = {
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#f0f0ff',
        userSelect: 'none',
    };

    const faqAStyle = (isOpen) => ({
        maxHeight: isOpen ? '200px' : '0',
        opacity: isOpen ? 1 : 0,
        padding: isOpen ? '0 18px 14px' : '0 18px',
        fontSize: '0.83rem',
        lineHeight: '1.55',
        color: 'rgba(255,255,255,0.6)',
        transition: 'max-height 0.3s ease, opacity 0.25s ease, padding 0.3s ease',
        overflow: 'hidden',
    });

    const chevronStyle = (isOpen) => ({
        fontSize: '0.7rem',
        transition: 'transform 0.25s ease',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        color: '#ff5500',
    });

    const quickLinkCardStyle = {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '8px',
    };

    const inputStyle = {
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '11px 14px',
        color: '#f0f0ff',
        fontFamily: 'var(--font-family)',
        fontSize: '0.88rem',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    };

    const submitBtnStyle = {
        background: formStatus === 'sent'
            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
            : 'linear-gradient(135deg, #ff5500 0%, #ff7700 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '13px 28px',
        fontSize: '0.9rem',
        fontWeight: '700',
        cursor: formStatus === 'sending' ? 'not-allowed' : 'pointer',
        opacity: formStatus === 'sending' ? 0.7 : 1,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 20px rgba(255,85,0,0.2)',
        width: '100%',
        marginTop: '6px',
    };

    /* ────── Active Support nav link style ────── */
    const supportNavLinkStyle = {
        ...navLinkStyle,
        color: supportOpen ? '#ff5500' : navLinkStyle.color,
        textShadow: supportOpen ? '0 0 8px rgba(255,85,0,0.5)' : 'none',
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
                background: 'radial-gradient(circle, rgba(255, 85, 0, 0.2) 0%, rgba(255, 85, 0, 0.05) 50%, rgba(0,0,0,0) 70%)',
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
                    <li><span style={supportNavLinkStyle} onClick={toggleSupport} className="nav-hover-link">Support</span></li>
                </ul>

                <div style={rightNavStyle}>
                    <button 
                        onClick={() => navigate('/register')}
                        style={{
                            background: 'var(--color-cyan)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(255,85,0,0.2)',
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
                </div>
            </section>

            {/* Empty footer area to align content perfectly like the mock */}
            <div style={{ height: '80px', width: '100%' }}></div>

            {/* ═══════════ SUPPORT PANEL OVERLAY ═══════════ */}
            <div style={overlayStyle} onClick={toggleSupport} />

            {/* ═══════════ SUPPORT SLIDE-OUT PANEL ═══════════ */}
            <aside style={panelStyle} id="support-panel">
                {/* ── Header ── */}
                <div style={panelHeaderStyle}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.02em' }}>
                            <span style={{ color: '#ff5500' }}>⚡</span> Support Center
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            We're here to help you win
                        </div>
                    </div>
                    <button
                        style={closeBtnStyle}
                        onClick={toggleSupport}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,85,0,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,85,0,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        aria-label="Close support panel"
                    >
                        ✕
                    </button>
                </div>

                {/* ── Body ── */}
                <div style={panelBodyStyle}>




                    {/* ── FAQ ── */}
                    <div style={sectionTitleStyle}>Frequently Asked Questions</div>
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} style={faqItemStyle(expandedFaq === i)}>
                            <div style={faqQStyle} onClick={() => toggleFaq(i)}>
                                <span>{item.q}</span>
                                <span style={chevronStyle(expandedFaq === i)}>▼</span>
                            </div>
                            <div style={faqAStyle(expandedFaq === i)}>
                                {item.a}
                            </div>
                        </div>
                    ))}

                    {/* ── Contact Form ── */}
                    <div style={sectionTitleStyle}>Send Us a Message</div>
                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <input
                                style={inputStyle}
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleFormChange}
                                onFocus={(e) => { e.target.style.borderColor = 'rgba(255,85,0,0.4)'; e.target.style.boxShadow = '0 0 10px rgba(255,85,0,0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                                required
                            />
                            <input
                                style={inputStyle}
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleFormChange}
                                onFocus={(e) => { e.target.style.borderColor = 'rgba(255,85,0,0.4)'; e.target.style.boxShadow = '0 0 10px rgba(255,85,0,0.1)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                                required
                            />
                        </div>
                        <input
                            style={inputStyle}
                            type="text"
                            name="subject"
                            placeholder="Subject (optional)"
                            value={formData.subject}
                            onChange={handleFormChange}
                            onFocus={(e) => { e.target.style.borderColor = 'rgba(255,85,0,0.4)'; e.target.style.boxShadow = '0 0 10px rgba(255,85,0,0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                        />
                        <textarea
                            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                            name="message"
                            placeholder="Describe your issue or question..."
                            value={formData.message}
                            onChange={handleFormChange}
                            onFocus={(e) => { e.target.style.borderColor = 'rgba(255,85,0,0.4)'; e.target.style.boxShadow = '0 0 10px rgba(255,85,0,0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                            required
                        />
                        <button
                            type="submit"
                            style={submitBtnStyle}
                            disabled={formStatus === 'sending'}
                            onMouseEnter={(e) => { if (formStatus !== 'sending' && formStatus !== 'sent') e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {formStatus === 'sending' ? '⏳ Sending...'
                             : formStatus === 'sent' ? '✓ Message Sent!'
                             : '🚀 Send Message'}
                        </button>
                    </form>

                    {/* ── Direct Contact ── */}
                    <div style={sectionTitleStyle}>Or Reach Out Directly</div>
                    <div style={{
                        display: 'flex', gap: '12px', flexWrap: 'wrap',
                    }}>
                        <a
                            href="mailto:support@playnex.com"
                            style={{
                                flex: 1,
                                minWidth: '180px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                textDecoration: 'none',
                                color: '#f0f0ff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,85,0,0.25)'; e.currentTarget.style.background = 'rgba(255,85,0,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>📧</span>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.82rem' }}>Email</div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.76rem' }}>support@playnex.com</div>
                            </div>
                        </a>

                    </div>

                    {/* Bottom spacer */}
                    <div style={{ height: '30px' }} />
                </div>
            </aside>
        </div>
    );
};

export default LandingPage;
