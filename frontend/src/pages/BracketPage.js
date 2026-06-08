import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentService, matchService, userService } from '../services/api';

const BracketPage = () => {
    const { gameId } = useParams();
    const [activeTab, setActiveTab] = useState('bracket');
    const [selectedStage, setSelectedStage] = useState('winners');
    const [tournament, setTournament] = useState(null);
    const [registered, setRegistered] = useState(false);
    const [playersCount, setPlayersCount] = useState(0);

    // States for Match API Telemetry Simulation Modal
    const [showApiModal, setShowApiModal] = useState(false);
    const [apiModalData, setApiModalData] = useState(null);
    const [apiFetchStatus, setApiFetchStatus] = useState('idle'); // 'idle' | 'fetching' | 'success'
    const [apiLogs, setApiLogs] = useState([]);
    const [simulatedWinner, setSimulatedWinner] = useState(null); // 'A' or 'B'
    const [simulatedStats, setSimulatedStats] = useState(null);

    // Quick Add Player States
    const [selectedQuickAddUser, setSelectedQuickAddUser] = useState('');
    const [allUsers, setAllUsers] = useState([]);

    // Dynamic Bracket data (Stateful so we can update scores on click)
    const [roundOf16Matches, setRoundOf16Matches] = useState([]);
    const [quarterMatches, setQuarterMatches] = useState([]);
    const [semiMatches, setSemiMatches] = useState([]);
    const [finalMatches, setFinalMatches] = useState([]);
    const [scheduleMatches, setScheduleMatches] = useState([]);

    const thirdPlaceMatch = { teamA: 'TBD', teamB: 'TBD', scoreA: null, scoreB: null };

    const fetchDetails = async () => {
        try {
            console.log("[BracketPage] URL gameId param:", gameId);
            const response = await tournamentService.getAll();
            console.log("[BracketPage] Tournaments returned by backend:", response.data);
            
            // Redirect to latest tournament from database if visiting generic route
            if (gameId === 'csgo' && response.data && response.data.length > 0) {
                const latest = response.data[response.data.length - 1];
                console.log("[BracketPage] Auto-redirecting to latest tournament:", latest.name);
                window.location.replace(`/bracket/${latest._id}`);
                return;
            }

            const found = response.data.find(t => t._id === gameId);
            console.log("[BracketPage] Matching tournament object:", found);

            if (found) {
                setTournament(found);
                const userId = localStorage.getItem('playnex_userId');
                const isJoined = found.players && found.players.includes(userId);
                setRegistered(isJoined);
                setPlayersCount(found.players ? found.players.length : 0);
            }

            // Fetch all users for quick registration selector
            const usersRes = await userService.getAllUsers().catch(() => ({ data: [] }));
            setAllUsers(usersRes.data || []);
        } catch (err) {
            console.error("Failed loading tournament details:", err.message);
        }
    };

    useEffect(() => {
        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId]);

    // Dynamically initialize the playoff bracket tree based on database tournament players list
    useEffect(() => {
        if (!tournament || allUsers.length === 0) return;

        const getPlayerName = (id) => {
            const u = allUsers.find(user => user._id === id);
            return u ? u.username : `Player_${id.slice(-4)}`;
        };

        const max = parseInt(tournament.maxPlayers, 10) || 16;
        const playersList = tournament.players || [];
        const names = [];
        for (let i = 0; i < max; i++) {
            names.push(playersList[i] ? getPlayerName(playersList[i]) : 'TBD');
        }

        // Reset all rounds
        let r16 = [];
        let quarters = [];
        let semis = [];
        let finals = [
            { id: 15, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null }
        ];

        if (max === 2) {
            // Final is directly populated
            finals = [
                { id: 15, teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, winner: null }
            ];
        } else if (max === 4) {
            semis = [
                { id: 13, teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, winner: null },
                { id: 14, teamA: names[2], scoreA: null, teamB: names[3], scoreB: null, winner: null }
            ];
        } else if (max === 8) {
            quarters = [
                { id: 9, teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, winner: null },
                { id: 10, teamA: names[2], scoreA: null, teamB: names[3], scoreB: null, winner: null },
                { id: 11, teamA: names[4], scoreA: null, teamB: names[5], scoreB: null, winner: null },
                { id: 12, teamA: names[6], scoreA: null, teamB: names[7], scoreB: null, winner: null }
            ];
            semis = [
                { id: 13, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null },
                { id: 14, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null }
            ];
        } else {
            // 16 or default
            r16 = [
                { id: 1, teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, winner: null },
                { id: 2, teamA: names[2], scoreA: null, teamB: names[3], scoreB: null, winner: null },
                { id: 3, teamA: names[4], scoreA: null, teamB: names[5], scoreB: null, winner: null },
                { id: 4, teamA: names[6], scoreA: null, teamB: names[7], scoreB: null, winner: null },
                { id: 5, teamA: names[8], scoreA: null, teamB: names[9], scoreB: null, winner: null },
                { id: 6, teamA: names[10], scoreA: null, teamB: names[11], scoreB: null, winner: null },
                { id: 7, teamA: names[12], scoreA: null, teamB: names[13], scoreB: null, winner: null },
                { id: 8, teamA: names[14], scoreA: null, teamB: names[15], scoreB: null, winner: null }
            ];
            quarters = [
                { id: 9, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null },
                { id: 10, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null },
                { id: 11, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null },
                { id: 12, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null }
            ];
            semis = [
                { id: 13, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null },
                { id: 14, teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, winner: null }
            ];
        }

        let schedule = [];
        if (max === 2) {
            schedule = [
                { stage: 'Final', teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, status: 'Upcoming', matchIndex: 15 }
            ];
        } else if (max === 4) {
            schedule = [
                { stage: 'Semi Final (Match 1)', teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, status: 'Upcoming', matchIndex: 13 },
                { stage: 'Semi Final (Match 2)', teamA: names[2], scoreA: null, teamB: names[3], scoreB: null, status: 'Upcoming', matchIndex: 14 },
                { stage: 'Final', teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, status: 'Upcoming', matchIndex: 15 }
            ];
        } else {
            schedule = [
                { stage: 'Round of 16 (Match 1)', teamA: names[0], scoreA: null, teamB: names[1], scoreB: null, status: 'Upcoming', matchIndex: 1 },
                { stage: 'Quarter Final', teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, status: 'Upcoming', matchIndex: 9 },
                { stage: 'Semi Final', teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, status: 'Upcoming', matchIndex: 13 },
                { stage: 'Final', teamA: 'TBD', scoreA: null, teamB: 'TBD', scoreB: null, status: 'Upcoming', matchIndex: 15 }
            ];
        }

        setRoundOf16Matches(r16);
        setQuarterMatches(quarters);
        setSemiMatches(semis);
        setFinalMatches(finals);
        setScheduleMatches(schedule);
    }, [tournament, allUsers]);

    const handleJoinTournament = async () => {
        const userId = localStorage.getItem('playnex_userId');
        if (!userId) {
            alert("You are currently in Guest Mode. Please select a player profile from the top-right corner of the Navbar to join tournaments!");
            return;
        }

        let targetId = gameId;

        try {
            // Auto register the tournament template if we are on mock view
            if (gameId === 'csgo' || !tournament) {
                const allTournaments = await tournamentService.getAll();
                const existing = allTournaments.data.find(t => t.name === 'Counter Strike Global Offensive Fall Major');
                
                if (existing) {
                    targetId = existing._id;
                } else {
                    const createRes = await tournamentService.create({
                        name: 'Counter Strike Global Offensive Fall Major',
                        game: 'Counter Strike (PC)',
                        maxPlayers: 16,
                        status: 'running'
                    });
                    targetId = createRes.data._id;
                }
            }

            await tournamentService.join(targetId, userId);
            alert("🎉 You successfully registered for this tournament!");

            if (gameId === 'csgo') {
                window.location.href = `/bracket/${targetId}`;
            } else {
                fetchDetails();
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                alert(`Status: ${err.response.data.error}`);
            } else {
                console.error(err);
                alert("Action failed. Make sure tournament-service backend is running.");
            }
        }
    };

    const handleQuickAddPlayer = async () => {
        if (!selectedQuickAddUser || !tournament) return;
        try {
            await tournamentService.join(tournament._id, selectedQuickAddUser);
            alert("🎉 Player successfully added to the tournament!");
            setSelectedQuickAddUser('');
            fetchDetails();
        } catch (error) {
            alert("Failed adding player: " + (error.response?.data?.error || error.message));
        }
    };

    // Trigger match resolution modal (Match Integration Hub)
    const handleSimulateMatch = (matchIdLocal, matchStage, teamA, teamB) => {
        if (gameId === 'csgo' || !tournament) {
            alert("Please Register/Join the tournament first to save it to the DB before playing matches!");
            return;
        }

        if (teamA === 'TBD' || teamB === 'TBD') {
            alert("Cannot simulate match with TBD players!");
            return;
        }

        const playerAUser = allUsers.find(u => u.username === teamA);
        const playerBUser = allUsers.find(u => u.username === teamB);
        
        if (!playerAUser || !playerBUser) {
            alert(`Could not resolve player profiles. Both players (${teamA} and ${teamB}) must be registered and match database users exactly to sync results.`);
            return;
        }
        
        const playerAId = playerAUser._id;
        const playerBId = playerBUser._id;
        
        // Open the Match Integration Hub simulator modal
        setApiModalData({ 
            matchIdLocal, 
            matchStage, 
            teamA, 
            teamB,
            playerAId,
            playerBId
        });
        setApiFetchStatus('idle');
        setApiLogs([]);
        setSimulatedWinner(null);
        setSimulatedStats(null);
        setShowApiModal(true);
    };

    const triggerApiSimulation = (scenario) => {
        setApiFetchStatus('fetching');
        setApiLogs([]);
        setSimulatedWinner(scenario);

        const logs = [
            "🔄 Establishing connection to game developer portal API...",
            "📡 Requesting telemetry files for session: MATCH_ID_94829103...",
            "🗄️ Downloading compressed telemetry file (Size: 4.2 MB)...",
            "🛠️ Parsing combat log metrics and position coordinates...",
            `📊 Verifying player handles: ${apiModalData.teamA.replace(/\s+/g, '')}_PlayNex & ${apiModalData.teamB.replace(/\s+/g, '')}_PlayNex...`,
            "🏆 Match outcome resolved successfully!"
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setApiLogs(prev => [...prev, logs[i]]);
                i++;
            } else {
                clearInterval(interval);
                setApiFetchStatus('success');

                const isA = scenario === 'A';
                const winKills = isA ? 14 : 12;
                const winDmg = isA ? 1420 : 1280;
                const winHs = isA ? 4 : 3;

                const loseKills = isA ? 5 : 6;
                const loseDmg = isA ? 620 : 580;
                const loseHs = isA ? 1 : 0;

                setSimulatedStats({
                    game: tournament ? tournament.game : "PUBG: Battlegrounds (PC)",
                    duration: "21m 45s",
                    server: "AP-Northeast (Tokyo)",
                    playerA: {
                        name: apiModalData.teamA,
                        gameId: `${apiModalData.teamA.replace(/\s+/g, '')}_PlayNex`,
                        kills: isA ? winKills : loseKills,
                        damage: isA ? winDmg : loseDmg,
                        headshots: isA ? winHs : loseHs,
                        status: isA ? "WINNER" : "ELIMINATED"
                    },
                    playerB: {
                        name: apiModalData.teamB,
                        gameId: `${apiModalData.teamB.replace(/\s+/g, '')}_PlayNex`,
                        kills: isA ? loseKills : winKills,
                        damage: isA ? loseDmg : winDmg,
                        headshots: isA ? loseHs : winHs,
                        status: isA ? "ELIMINATED" : "WINNER"
                    }
                });
            }
        }, 300);
    };

    const handleConfirmSync = async () => {
        const { matchIdLocal, teamA, teamB, playerAId, playerBId } = apiModalData;
        const winnerId = simulatedWinner === 'A' ? playerAId : playerBId;

        try {
            // 1. Create a match on the backend match-service
            const matchRes = await matchService.create({
                tournamentId: gameId,
                players: [playerAId, playerBId],
                status: 'pending'
            });

            const matchDbId = matchRes.data._id;

            // 2. Submit winner to match service
            await matchService.addResult(matchDbId, winnerId);

            alert(`🏆 Match synced! Winner: ${simulatedWinner === 'A' ? teamA : teamB}. Stats and leaderboard points successfully updated.`);

            const scoreWin = 16;
            const scoreLose = 10;

            // 3. Update scores inside react state to reflect results in real-time
            if (matchIdLocal <= 8) {
                setRoundOf16Matches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: simulatedWinner === 'A' ? teamA : teamB
                } : m));
            } else if (matchIdLocal <= 12) {
                setQuarterMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: simulatedWinner === 'A' ? teamA : teamB
                } : m));
            } else if (matchIdLocal <= 14) {
                setSemiMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: simulatedWinner === 'A' ? teamA : teamB
                } : m));
            } else if (matchIdLocal === 15) {
                setFinalMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: simulatedWinner === 'A' ? teamA : teamB
                } : m));
            }

            // Also update scheduleMatches in state
            setScheduleMatches(prev => prev.map(m => m.matchIndex === matchIdLocal ? {
                ...m,
                scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                status: 'Completed'
            } : m));

            // Reset modal states
            setShowApiModal(false);
            setApiModalData(null);
            setApiFetchStatus('idle');
            setApiLogs([]);
            setSimulatedWinner(null);
            setSimulatedStats(null);
        } catch (err) {
            console.error("Match sync failed:", err.message);
            alert("Action failed. Make sure match-service and leaderboard-service are running.");
        }
    };

    const availableUsers = allUsers.filter(u => {
        return tournament && tournament.players && !tournament.players.includes(u._id);
    });

    const maxPlayersVal = tournament ? (parseInt(tournament.maxPlayers, 10) || 16) : 16;
    const minWidthVal = maxPlayersVal === 2 ? '300px' : maxPlayersVal === 4 ? '600px' : maxPlayersVal === 8 ? '800px' : '1000px';

    return (
        <div style={{ paddingBottom: '60px' }}>
            {/* Breadcrumb path */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                All games &gt; Marketplace &gt; {tournament ? tournament.game : 'Counter Strike Global Offensive'}
            </div>

            {/* Hero Tournament Title */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                background: 'linear-gradient(90deg, rgba(123, 44, 191, 0.15) 0%, rgba(12, 8, 34, 0) 100%)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-glass)'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
                        {tournament ? tournament.name : 'Counter Strike Global Offensive'}
                    </h1>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-cyan)', fontWeight: '600' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-cyan)' }}></span>
                            Tier 1 Major
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>|</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Players Joined: {playersCount} / {tournament ? tournament.maxPlayers : '16'}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {registered ? (
                        <span className="badge badge-completed" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Registered</span>
                    ) : (
                        <button 
                            onClick={handleJoinTournament}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            Join Tournament
                        </button>
                    )}
                    
                    {/* Quick Add Player Selector */}
                    {tournament && tournament.players && tournament.players.length < tournament.maxPlayers && (
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            alignItems: 'center', 
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-glass)',
                            marginTop: '6px'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Quick Add:</span>
                            <select 
                                value={selectedQuickAddUser}
                                onChange={(e) => setSelectedQuickAddUser(e.target.value)}
                                style={{ 
                                    background: 'rgba(12, 8, 34, 0.8)', 
                                    border: '1px solid var(--border-glass)', 
                                    borderRadius: '4px', 
                                    color: '#fff', 
                                    padding: '4px 8px',
                                    fontSize: '0.8rem',
                                    outline: 'none'
                                }}
                            >
                                <option value="">-- Select --</option>
                                {availableUsers.map(user => (
                                    <option key={user._id} value={user._id}>{user.username}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleQuickAddPlayer}
                                className="btn-success"
                                style={{ padding: '4px 10px', fontSize: '0.8rem', height: '26px', boxShadow: 'none' }}
                                disabled={!selectedQuickAddUser}
                            >
                                Add
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs System */}
            <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid var(--border-glass)', 
                marginBottom: '30px',
                gap: '4px'
            }}>
                {['about', 'bracket', 'stream', 'standings', 'matches'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '12px 24px',
                            color: activeTab === tab ? 'var(--color-cyan)' : 'var(--text-muted)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab ? '3px solid var(--color-cyan)' : '3px solid transparent',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'var(--transition-smooth)'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* TAB CONTENTS */}

            {/* 1. About Tab */}
            {activeTab === 'about' && (
                <div className="glass-panel" style={{ padding: '30px', lineHeight: '1.7' }}>
                    <h2 style={{ marginBottom: '15px', color: '#fff' }}>Tournament Description</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                        Welcome to the Counter Strike Global Offensive Fall Major 2026. The world's top 16 professional teams compete head-to-head in a double-elimination bracket for the lion's share of the $250,000 prize pool and a direct seed to the PlayNex Championship Finals.
                    </p>
                    <h3 style={{ marginBottom: '10px', color: '#fff' }}>Rules & Format</h3>
                    <ul style={{ color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '20px' }}>
                        <li>All Bracket matches are Best of 3 (Bo3).</li>
                        <li>Grand Finals are Best of 5 (Bo5) with a 1-map advantage for the upper bracket winner.</li>
                        <li>Active Map Pool: Mirage, Inferno, Nuke, Overpass, Vertigo, Ancient, Anubis.</li>
                    </ul>
                </div>
            )}

            {/* 2. Bracket Tab */}
            {activeTab === 'bracket' && (
                <div>
                    {/* Stage Selector */}
                    {maxPlayersVal > 2 && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                            <button 
                                className={selectedStage === 'winners' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setSelectedStage('winners')}
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                                Winners Bracket
                            </button>
                            <button 
                                className={selectedStage === 'losers' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setSelectedStage('losers')}
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                                Losers Bracket (Round 4)
                            </button>
                        </div>
                    )}

                    {/* Bracket visual tree wrapper */}
                    <div className="glass-panel" style={{ 
                        padding: '40px 20px', 
                        overflowX: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '40px',
                            minWidth: minWidthVal,
                            position: 'relative',
                            justifyContent: 'center'
                        }}>
                            {/* Column 1: Round of 16 */}
                            {maxPlayersVal >= 16 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                        Round of 16 (Click to Simulate)
                                    </h3>
                                    {roundOf16Matches.map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => handleSimulateMatch(m.id, `Match ${m.id}`, m.teamA, m.teamB)}
                                            style={{
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-glass)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                cursor: 'pointer'
                                            }}
                                            className="glass-card"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.teamA ? '#fff' : 'var(--text-muted)', fontWeight: m.winner === m.teamA ? '700' : '400' }}>
                                                <span>🥇 {m.teamA}</span>
                                                <span>{m.scoreA !== null ? m.scoreA : '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.teamB ? '#fff' : 'var(--text-muted)', fontWeight: m.winner === m.teamB ? '700' : '400' }}>
                                                <span>🥈 {m.teamB}</span>
                                                <span>{m.scoreB !== null ? m.scoreB : '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Column 2: Quarter Final */}
                            {maxPlayersVal >= 8 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '100px', justifyContent: 'center', flex: 1 }}>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                        Quarter Final
                                    </h3>
                                    {quarterMatches.map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => handleSimulateMatch(m.id, 'Quarter Final', m.teamA, m.teamB)}
                                            style={{
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-glass)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                cursor: 'pointer'
                                            }}
                                            className="glass-card"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.teamA ? '#fff' : 'var(--text-muted)', fontWeight: m.winner === m.teamA ? '700' : '400' }}>
                                                <span>{m.teamA}</span>
                                                <span>{m.scoreA !== null ? m.scoreA : '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.teamB ? '#fff' : 'var(--text-muted)', fontWeight: m.winner === m.teamB ? '700' : '400' }}>
                                                <span>{m.teamB}</span>
                                                <span>{m.scoreB !== null ? m.scoreB : '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Column 3: Semi Final */}
                            {maxPlayersVal >= 4 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '260px', justifyContent: 'center', flex: 1 }}>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                        Semi Final
                                    </h3>
                                    {semiMatches.map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => handleSimulateMatch(m.id, 'Semi Final', m.teamA, m.teamB)}
                                            style={{
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-glass)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                cursor: 'pointer'
                                            }}
                                            className="glass-card"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.teamA ? '#fff' : 'var(--text-muted)', fontWeight: m.winner === m.teamA ? '700' : '400' }}>
                                                <span>{m.teamA}</span>
                                                <span>{m.scoreA !== null ? m.scoreA : '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m.winner === m.teamB ? '#fff' : 'var(--text-muted)', fontWeight: m.winner === m.teamB ? '700' : '400' }}>
                                                <span>{m.teamB}</span>
                                                <span>{m.scoreB !== null ? m.scoreB : '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Column 4: Final */}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: '260px' }}>
                                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                    Final
                                </h3>
                                {finalMatches.map(m => (
                                    <div 
                                        key={m.id} 
                                        onClick={() => handleSimulateMatch(m.id, 'Final', m.teamA, m.teamB)}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(0, 255, 240, 0.1) 0%, rgba(255, 0, 127, 0.1) 100%)',
                                            border: '1px solid var(--color-cyan)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            boxShadow: '0 0 15px var(--color-cyan-glow)',
                                            cursor: 'pointer'
                                        }}
                                        className="glass-card"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: m.winner === m.teamA ? '#fff' : 'var(--text-muted)' }}>
                                            <span>🏆 {m.teamA}</span>
                                            <span>{m.scoreA !== null ? m.scoreA : '-'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: m.winner === m.teamB ? '#fff' : 'var(--text-muted)' }}>
                                            <span>🏆 {m.teamB}</span>
                                            <span>{m.scoreB !== null ? m.scoreB : '-'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Third Place playoff */}
                        {maxPlayersVal >= 4 && (
                            <div style={{
                                borderTop: '1px solid var(--border-glass)',
                                paddingTop: '25px',
                                marginTop: '15px'
                            }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Third place play-off</h4>
                                <div style={{
                                    width: '280px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>🥉 {thirdPlaceMatch.teamA}</span>
                                        <span>{thirdPlaceMatch.scoreA !== null ? thirdPlaceMatch.scoreA : '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                                        <span>🥉 {thirdPlaceMatch.teamB}</span>
                                        <span>{thirdPlaceMatch.scoreB !== null ? thirdPlaceMatch.scoreB : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Stream Tab */}
            {activeTab === 'stream' && (
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }} className="hidden-mobile-grid">
                    {/* Video Player Area */}
                    <div className="glass-panel" style={{ padding: '12px', background: '#000' }}>
                        <div style={{
                            position: 'relative',
                            paddingTop: '56.25%', // 16:9 aspect ratio
                            width: '100%'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #110022 0%, #000000 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg viewBox="0 0 24 24" width="60" height="60" fill="var(--color-pink)">
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                <span style={{ marginTop: '12px', fontWeight: 'bold', color: '#fff', fontSize: '1.2rem' }}>CS:GO Major Finals Broadcast</span>
                                <span className="badge badge-running" style={{ marginTop: '10px' }}>LIVE STREAM MOCK</span>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                        <div style={{ padding: '12px', borderBottom: '1px solid var(--border-glass)', fontWeight: 'bold' }}>Live Chat</div>
                        <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                            <div><strong className="text-cyan">PlayerOne:</strong> Let's go Dallas! 🏆</div>
                            <div><strong className="text-pink">GamerMax:</strong> Clutch plays incoming</div>
                            <div><strong style={{ color: 'var(--color-green)' }}>SniperX:</strong> Unbelievable accuracy!</div>
                            <div><strong className="text-cyan">Tactician:</strong> Bo3 maps are drafted!</div>
                        </div>
                        <div style={{ padding: '12px', borderTop: '1px solid var(--border-glass)' }}>
                            <input 
                                type="text" 
                                placeholder="Send a message..." 
                                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Standings Tab */}
            {activeTab === 'standings' && (
                <div className="glass-panel" style={{ padding: '10px' }}>
                    <table className="game-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Team Name</th>
                                <th>Matches Played</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Win Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { rank: 1, team: 'Dallas Mavericks', mp: 5, w: 5, l: 0, wr: '100%' },
                                { rank: 2, team: 'Home Runner', mp: 6, w: 4, l: 2, wr: '66.7%' },
                                { rank: 3, team: 'Manner Runs', mp: 4, w: 3, l: 1, wr: '75%' },
                                { rank: 4, team: 'Barcelona FC', mp: 4, w: 2, l: 2, wr: '50%' },
                            ].map((team) => (
                                <tr key={team.rank}>
                                    <td><strong>#{team.rank}</strong></td>
                                    <td style={{ fontWeight: '600' }}>{team.team}</td>
                                    <td>{team.mp}</td>
                                    <td className="text-cyan">{team.w}</td>
                                    <td className="text-pink">{team.l}</td>
                                    <td>{team.wr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 5. Matches Tab */}
            {activeTab === 'matches' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {scheduleMatches.map((match, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleSimulateMatch(match.matchIndex, match.stage, match.teamA, match.teamB)}
                            className="glass-card" 
                            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span>{match.stage} (Click to Simulate)</span>
                                <span className={match.status === 'Completed' ? 'text-pink' : 'text-cyan'}>{match.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <span style={{ fontWeight: match.scoreA > match.scoreB ? 'bold' : 'normal' }}>{match.teamA}</span>
                                    <span style={{ fontWeight: match.scoreB > match.scoreA ? 'bold' : 'normal' }}>{match.teamB}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                    <span>{match.scoreA !== null ? match.scoreA : '-'}</span>
                                    <span>{match.scoreB !== null ? match.scoreB : '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Match Integration Hub API Simulator Modal */}
            {showApiModal && apiModalData && (
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
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)',
                    fontFamily: "'Outfit', sans-serif"
                }}>
                    <div className="glass-panel" style={{
                        width: '600px',
                        padding: '30px',
                        position: 'relative',
                        border: '1px solid rgba(0, 255, 240, 0.25)',
                        boxShadow: '0 0 40px rgba(0, 255, 240, 0.15)'
                    }}>
                        {/* Close button */}
                        <button 
                            onClick={() => setShowApiModal(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.4rem'
                            }}
                        >
                            &times;
                        </button>

                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #fff, var(--color-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Match Integration Hub
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                            Query official game developer portals to fetch live combat telemetry and verify match outcomes automatically.
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Platform/Service API</span>
                                    <strong>{tournament?.game || 'PUBG: Battlegrounds'} API Connection</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Match Telemetry ID</span>
                                    <span style={{ color: 'var(--color-cyan)', fontWeight: 'bold' }}>PUBG_STEAM_MATCH_94829103</span>
                                </div>
                            </div>
                        </div>

                        {/* Scenario Selection */}
                        {apiFetchStatus === 'idle' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Simulate match scenario to retrieve from Developer API:</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => triggerApiSimulation('A')}
                                        style={{ padding: '14px', fontSize: '0.9rem' }}
                                    >
                                        Retrieve Win for {apiModalData.teamA}
                                    </button>
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => triggerApiSimulation('B')}
                                        style={{ padding: '14px', fontSize: '0.9rem', border: '1px solid var(--color-pink)' }}
                                    >
                                        Retrieve Win for {apiModalData.teamB}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Telemetry Loader Logs */}
                        {apiFetchStatus === 'fetching' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-cyan)' }} className="float-anim">
                                    Fetching telemetry log files...
                                </span>
                                <div style={{ background: '#070515', borderRadius: '8px', border: '1px solid var(--border-glass)', padding: '16px', height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#a5a3cf' }}>
                                    {apiLogs.map((log, index) => (
                                        <div key={index}>{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fetched Match Telemetry Summary */}
                        {apiFetchStatus === 'success' && simulatedStats && (
                            <div>
                                <div style={{ background: 'rgba(0, 255, 240, 0.04)', border: '1px solid rgba(0, 255, 240, 0.15)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span><strong>Server:</strong> {simulatedStats.server}</span>
                                    <span><strong>Match Duration:</strong> {simulatedStats.duration}</span>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} className="game-table">
                                    <thead>
                                        <tr>
                                            <th>Competitor Profile</th>
                                            <th>Game Account</th>
                                            <th style={{ textAlign: 'center' }}>Kills</th>
                                            <th style={{ textAlign: 'center' }}>Damage</th>
                                            <th style={{ textAlign: 'center' }}>Headshots</th>
                                            <th style={{ textAlign: 'right' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>{simulatedStats.playerA.name}</strong></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{simulatedStats.playerA.gameId}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{simulatedStats.playerA.kills}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{simulatedStats.playerA.damage}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{simulatedStats.playerA.headshots}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '800', color: simulatedStats.playerA.status === 'WINNER' ? 'var(--color-green)' : 'var(--color-pink)' }}>
                                                {simulatedStats.playerA.status}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><strong>{simulatedStats.playerB.name}</strong></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{simulatedStats.playerB.gameId}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{simulatedStats.playerB.kills}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{simulatedStats.playerB.damage}</td>
                                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{simulatedStats.playerB.headshots}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '800', color: simulatedStats.playerB.status === 'WINNER' ? 'var(--color-green)' : 'var(--color-pink)' }}>
                                                {simulatedStats.playerB.status}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={() => setApiFetchStatus('idle')}
                                        style={{ padding: '10px 20px' }}
                                    >
                                        Re-sim
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-primary" 
                                        onClick={handleConfirmSync}
                                        style={{ padding: '10px 24px' }}
                                    >
                                        Confirm & Sync to Leaderboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BracketPage;
