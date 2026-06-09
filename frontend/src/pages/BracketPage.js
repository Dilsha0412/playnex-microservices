import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentService, matchService, userService, leaderboardService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const getTelemetryId = (gameName) => {
    if (!gameName) return 'MATCH_94829103';
    const prefix = gameName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');
    return `${prefix || 'GAME'}_MATCH_94829103`;
};

const BracketPage = () => {
    const { success, error, info } = useNotification();
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
    const [dbMatches, setDbMatches] = useState([]);

    // Quick Add Player States
    const [selectedQuickAddUser, setSelectedQuickAddUser] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [isQuickAddDropdownOpen, setIsQuickAddDropdownOpen] = useState(false);
    const quickAddDropdownRef = useRef(null);

    // Dynamic Bracket data (Stateful so we can update scores on click)
    const [roundOf16Matches, setRoundOf16Matches] = useState([]);
    const [quarterMatches, setQuarterMatches] = useState([]);
    const [semiMatches, setSemiMatches] = useState([]);
    const [finalMatches, setFinalMatches] = useState([]);
    const [losersMatches, setLosersMatches] = useState([]);
    const [scheduleMatches, setScheduleMatches] = useState([]);

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

            // Fetch completed matches from database
            if (gameId && gameId !== 'csgo') {
                try {
                    const matchesRes = await matchService.getTournamentMatches(gameId);
                    setDbMatches(matchesRes.data || []);
                } catch (err) {
                    console.error("Failed fetching completed matches for tournament:", err.message);
                }
            }
        } catch (err) {
            console.error("Failed loading tournament details:", err.message);
        }
    };

    useEffect(() => {
        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (quickAddDropdownRef.current && !quickAddDropdownRef.current.contains(event.target)) {
                setIsQuickAddDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Dynamically initialize the playoff bracket tree based on database tournament players list
    useEffect(() => {
        if (!tournament || allUsers.length === 0) return;

        const getPlayerName = (id) => {
            const u = allUsers.find(user => user._id === id);
            return u ? u.username : `Player_${id.slice(-4)}`;
        };

        const max = parseInt(tournament.maxPlayers, 10) || 16;
        const bracketSize = max <= 2 ? 2 : max <= 4 ? 4 : max <= 8 ? 8 : 16;
        const playersList = tournament.players || [];
        const names = [];
        for (let i = 0; i < bracketSize; i++) {
            if (i < playersList.length) {
                names.push(getPlayerName(playersList[i]));
            } else if (i < max) {
                names.push('TBD'); // Waiting for real players to join
            } else {
                names.push(`Bot ${i + 1}`); // Pad remaining bracket slots
            }
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

        // Helper to resolve player IDs
        const getPlayerId = (teamName) => {
            if (!teamName || teamName === 'TBD') return null;
            if (teamName.startsWith('Bot ')) {
                return `bot_${teamName.replace(/\s+/g, '')}`;
            }
            const u = allUsers.find(user => user.username === teamName);
            return u ? u._id : null;
        };

        // Helper to check if a match is saved in dbMatches and update it
        const resolveMatch = (m) => {
            if (m.teamA === 'TBD' || m.teamB === 'TBD') return m;
            const pA = getPlayerId(m.teamA);
            const pB = getPlayerId(m.teamB);
            if (!pA || !pB) return m;

            const dbMatch = dbMatches.find(dm => {
                if (dm.status !== 'completed') return false;
                if (dm.matchIndex !== undefined && dm.matchIndex !== null) {
                    return dm.matchIndex === m.id;
                }
                return dm.players.includes(pA) && dm.players.includes(pB);
            });

            if (dbMatch) {
                const winnerName = dbMatch.winner === pA ? m.teamA : m.teamB;
                return {
                    ...m,
                    scoreA: dbMatch.winner === pA ? 16 : 10,
                    scoreB: dbMatch.winner === pB ? 16 : 10,
                    winner: winnerName
                };
            }
            return m;
        };

        // Resolve Round of 16 (only if max >= 16)
        if (max >= 16) {
            r16 = r16.map(resolveMatch);
            // Advance winners to quarters
            r16.forEach(m => {
                if (m.winner) {
                    const nextMatchId = Math.ceil(m.id / 2) + 8;
                    const isTeamA = m.id % 2 !== 0;
                    const qIdx = quarters.findIndex(q => q.id === nextMatchId);
                    if (qIdx !== -1) {
                        if (isTeamA) quarters[qIdx].teamA = m.winner;
                        else quarters[qIdx].teamB = m.winner;
                    }
                }
            });
        }

        // Resolve Quarters (if max >= 8)
        if (max >= 8) {
            quarters = quarters.map(resolveMatch);
            // Advance winners to semis
            quarters.forEach(m => {
                if (m.winner) {
                    const nextMatchId = Math.ceil((m.id - 8) / 2) + 12;
                    const isTeamA = m.id % 2 !== 0;
                    const sIdx = semis.findIndex(s => s.id === nextMatchId);
                    if (sIdx !== -1) {
                        if (isTeamA) semis[sIdx].teamA = m.winner;
                        else semis[sIdx].teamB = m.winner;
                    }
                }
            });
        }

        // Resolve Semis (if max >= 4)
        if (max >= 4) {
            semis = semis.map(resolveMatch);
            // Advance winners to final
            semis.forEach(m => {
                if (m.winner) {
                    const nextMatchId = 15;
                    const isTeamA = m.id === 13;
                    const fIdx = finals.findIndex(f => f.id === nextMatchId);
                    if (fIdx !== -1) {
                        if (isTeamA) finals[fIdx].teamA = m.winner;
                        else finals[fIdx].teamB = m.winner;
                    }
                }
            });
        }

        // Resolve Finals
        finals = finals.map(resolveMatch);

        // Construct and resolve losers matches
        let losers = [];
        const getLoser = (m) => {
            if (!m || !m.winner || m.winner === 'TBD') return 'TBD';
            return m.winner === m.teamA ? m.teamB : m.teamA;
        };

        if (max === 4) {
            let m21 = { id: 21, teamA: getLoser(semis[0]), teamB: getLoser(semis[1]), scoreA: null, scoreB: null, winner: null };
            m21 = resolveMatch(m21);
            losers = [m21];
        } else if (max === 8) {
            let m21 = { id: 21, teamA: getLoser(quarters[0]), teamB: getLoser(quarters[1]), scoreA: null, scoreB: null, winner: null };
            let m22 = { id: 22, teamA: getLoser(quarters[2]), teamB: getLoser(quarters[3]), scoreA: null, scoreB: null, winner: null };
            m21 = resolveMatch(m21);
            m22 = resolveMatch(m22);

            let m23 = { id: 23, teamA: m21.winner || 'TBD', teamB: getLoser(semis[1]), scoreA: null, scoreB: null, winner: null };
            let m24 = { id: 24, teamA: m22.winner || 'TBD', teamB: getLoser(semis[0]), scoreA: null, scoreB: null, winner: null };
            m23 = resolveMatch(m23);
            m24 = resolveMatch(m24);

            let m25 = { id: 25, teamA: m23.winner || 'TBD', teamB: m24.winner || 'TBD', scoreA: null, scoreB: null, winner: null };
            m25 = resolveMatch(m25);

            losers = [m21, m22, m23, m24, m25];
        }

        const schedule = [];
        if (max === 2) {
            const m15 = finals[0];
            schedule.push({
                stage: 'Final',
                teamA: m15.teamA,
                scoreA: m15.scoreA,
                teamB: m15.teamB,
                scoreB: m15.scoreB,
                status: m15.winner ? 'Completed' : 'Upcoming',
                matchIndex: 15
            });
        } else if (max === 4) {
            const m13 = semis[0];
            const m14 = semis[1];
            const m15 = finals[0];
            schedule.push(
                { stage: 'Semi Final (Match 1)', teamA: m13.teamA, scoreA: m13.scoreA, teamB: m13.teamB, scoreB: m13.scoreB, status: m13.winner ? 'Completed' : 'Upcoming', matchIndex: 13 },
                { stage: 'Semi Final (Match 2)', teamA: m14.teamA, scoreA: m14.scoreA, teamB: m14.teamB, scoreB: m14.scoreB, status: m14.winner ? 'Completed' : 'Upcoming', matchIndex: 14 },
                { stage: 'Final', teamA: m15.teamA, scoreA: m15.scoreA, teamB: m15.teamB, scoreB: m15.scoreB, status: m15.winner ? 'Completed' : 'Upcoming', matchIndex: 15 }
            );
        } else if (max === 8) {
            quarters.forEach((q, idx) => {
                schedule.push({ stage: `Quarter Final (Match ${idx + 1})`, teamA: q.teamA, scoreA: q.scoreA, teamB: q.teamB, scoreB: q.scoreB, status: q.winner ? 'Completed' : 'Upcoming', matchIndex: q.id });
            });
            semis.forEach((s, idx) => {
                schedule.push({ stage: `Semi Final (Match ${idx + 1})`, teamA: s.teamA, scoreA: s.scoreA, teamB: s.teamB, scoreB: s.scoreB, status: s.winner ? 'Completed' : 'Upcoming', matchIndex: s.id });
            });
            const m15 = finals[0];
            schedule.push({ stage: 'Final', teamA: m15.teamA, scoreA: m15.scoreA, teamB: m15.teamB, scoreB: m15.scoreB, status: m15.winner ? 'Completed' : 'Upcoming', matchIndex: 15 });
        } else {
            r16.forEach((r, idx) => {
                schedule.push({ stage: `Round of 16 (Match ${idx + 1})`, teamA: r.teamA, scoreA: r.scoreA, teamB: r.teamB, scoreB: r.scoreB, status: r.winner ? 'Completed' : 'Upcoming', matchIndex: r.id });
            });
            quarters.forEach((q, idx) => {
                schedule.push({ stage: `Quarter Final (Match ${idx + 1})`, teamA: q.teamA, scoreA: q.scoreA, teamB: q.teamB, scoreB: q.scoreB, status: q.winner ? 'Completed' : 'Upcoming', matchIndex: q.id });
            });
            semis.forEach((s, idx) => {
                schedule.push({ stage: `Semi Final (Match ${idx + 1})`, teamA: s.teamA, scoreA: s.scoreA, teamB: s.teamB, scoreB: s.scoreB, status: s.winner ? 'Completed' : 'Upcoming', matchIndex: s.id });
            });
            const m15 = finals[0];
            schedule.push({ stage: 'Final', teamA: m15.teamA, scoreA: m15.scoreA, teamB: m15.teamB, scoreB: m15.scoreB, status: m15.winner ? 'Completed' : 'Upcoming', matchIndex: 15 });
        }

        // Add losers matches to schedule
        losers.forEach(lm => {
            let stageName = '';
            if (max === 4) {
                stageName = 'Losers Final (3rd Place Playoff)';
            } else if (max === 8) {
                if (lm.id === 21 || lm.id === 22) stageName = `Losers Round 1 (Match ${lm.id - 20})`;
                else if (lm.id === 23 || lm.id === 24) stageName = `Losers Round 2 (Match ${lm.id - 22})`;
                else if (lm.id === 25) stageName = 'Losers Final (3rd Place Playoff)';
            }
            schedule.push({
                stage: stageName,
                teamA: lm.teamA,
                scoreA: lm.scoreA,
                teamB: lm.teamB,
                scoreB: lm.scoreB,
                status: lm.winner ? 'Completed' : 'Upcoming',
                matchIndex: lm.id
            });
        });

        setRoundOf16Matches(r16);
        setQuarterMatches(quarters);
        setSemiMatches(semis);
        setFinalMatches(finals);
        setLosersMatches(losers);
        setScheduleMatches(schedule);
    }, [tournament, allUsers, dbMatches]);

    const handleJoinTournament = async () => {
        const userId = localStorage.getItem('playnex_userId');
        if (!userId) {
            info("You are currently in Guest Mode. Please select a player profile from the top-right corner of the Navbar to join tournaments!");
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
            success("🎉 You successfully registered for this tournament!");

            if (gameId === 'csgo') {
                window.location.href = `/bracket/${targetId}`;
            } else {
                fetchDetails();
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                error(`Status: ${err.response.data.error}`);
            } else {
                console.error(err);
                error("Action failed. Make sure tournament-service backend is running.");
            }
        }
    };

    const handleQuickAddPlayer = async () => {
        if (!selectedQuickAddUser || !tournament) return;
        const label = tournament.competitorType === 'teams' ? 'Team' : 'Player';
        try {
            await tournamentService.join(tournament._id, selectedQuickAddUser);
            success(`🎉 ${label} successfully added to the tournament!`);
            setSelectedQuickAddUser('');
            fetchDetails();
        } catch (err) {
            error(`Failed adding ${label.toLowerCase()}: ` + (err.response?.data?.error || err.message));
        }
    };

    // Trigger match resolution modal (Match Integration Hub)
    const handleSimulateMatch = (matchIdLocal, matchStage, teamA, teamB) => {
        if (gameId === 'csgo' || !tournament) {
            info("Please Register/Join the tournament first to save it to the DB before playing matches!");
            return;
        }

        if (teamA === 'TBD' || teamB === 'TBD') {
            error("Cannot simulate match with TBD players!");
            return;
        }

        let playerAId = `bot_${teamA.replace(/\s+/g, '')}`;
        let playerBId = `bot_${teamB.replace(/\s+/g, '')}`;

        if (!teamA.startsWith('Bot ')) {
            const playerAUser = allUsers.find(u => u.username === teamA);
            if (!playerAUser) {
                error(`Could not resolve profile for ${teamA}. Real players must be registered to sync results.`);
                return;
            }
            playerAId = playerAUser._id;
        }

        if (!teamB.startsWith('Bot ')) {
            const playerBUser = allUsers.find(u => u.username === teamB);
            if (!playerBUser) {
                error(`Could not resolve profile for ${teamB}. Real players must be registered to sync results.`);
                return;
            }
            playerBId = playerBUser._id;
        }
        
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

        const telemetryId = getTelemetryId(tournament?.game);

        const logs = [
            "🔄 Establishing connection to game developer portal API...",
            `📡 Requesting telemetry files for session: ${telemetryId}...`,
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
                status: 'pending',
                matchIndex: matchIdLocal
            });

            const matchDbId = matchRes.data._id;

            // 2. Submit winner to match service
            await matchService.addResult(matchDbId, winnerId);

            success(`🏆 Match synced! Winner: ${simulatedWinner === 'A' ? teamA : teamB}. Stats and leaderboard points successfully updated.`);

            if (tournament && tournament.game) {
                localStorage.setItem('playnex_last_played_game', tournament.game);
            }

            const scoreWin = 16;
            const scoreLose = 10;

            const actualWinnerName = simulatedWinner === 'A' ? teamA : teamB;

            // 3. Update scores inside react state to reflect results in real-time
            if (matchIdLocal <= 8) {
                setRoundOf16Matches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: actualWinnerName
                } : m));

                // Advance winner to Quarter Finals (Matches 9-12)
                const nextMatchId = Math.ceil(matchIdLocal / 2) + 8;
                const isTeamA = matchIdLocal % 2 !== 0;
                setQuarterMatches(prev => prev.map(m => m.id === nextMatchId ? {
                    ...m,
                    teamA: isTeamA ? actualWinnerName : m.teamA,
                    teamB: !isTeamA ? actualWinnerName : m.teamB
                } : m));
                setScheduleMatches(prev => prev.map(m => m.matchIndex === nextMatchId ? {
                    ...m,
                    teamA: isTeamA ? actualWinnerName : m.teamA,
                    teamB: !isTeamA ? actualWinnerName : m.teamB
                } : m));

            } else if (matchIdLocal <= 12) {
                setQuarterMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: actualWinnerName
                } : m));

                // Advance winner to Semi Finals (Matches 13-14)
                const nextMatchId = Math.ceil((matchIdLocal - 8) / 2) + 12;
                const isTeamA = matchIdLocal % 2 !== 0; // 9,11 is odd -> teamA. 10,12 is even -> teamB
                setSemiMatches(prev => prev.map(m => m.id === nextMatchId ? {
                    ...m,
                    teamA: isTeamA ? actualWinnerName : m.teamA,
                    teamB: !isTeamA ? actualWinnerName : m.teamB
                } : m));
                setScheduleMatches(prev => prev.map(m => m.matchIndex === nextMatchId ? {
                    ...m,
                    teamA: isTeamA ? actualWinnerName : m.teamA,
                    teamB: !isTeamA ? actualWinnerName : m.teamB
                } : m));

            } else if (matchIdLocal <= 14) {
                setSemiMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: actualWinnerName
                } : m));

                // Advance winner to Final (Match 15)
                const nextMatchId = 15;
                const isTeamA = matchIdLocal === 13;
                setFinalMatches(prev => prev.map(m => m.id === nextMatchId ? {
                    ...m,
                    teamA: isTeamA ? actualWinnerName : m.teamA,
                    teamB: !isTeamA ? actualWinnerName : m.teamB
                } : m));
                setScheduleMatches(prev => prev.map(m => m.matchIndex === nextMatchId ? {
                    ...m,
                    teamA: isTeamA ? actualWinnerName : m.teamA,
                    teamB: !isTeamA ? actualWinnerName : m.teamB
                } : m));

            } else if (matchIdLocal === 15) {
                setFinalMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: actualWinnerName
                } : m));
            } else if (matchIdLocal >= 21 && matchIdLocal <= 25) {
                setLosersMatches(prev => prev.map(m => m.id === matchIdLocal ? {
                    ...m,
                    scoreA: simulatedWinner === 'A' ? scoreWin : scoreLose,
                    scoreB: simulatedWinner === 'B' ? scoreWin : scoreLose,
                    winner: actualWinnerName
                } : m));
            }

            // Automatically set tournament status to completed in DB when the final match is completed
            const isTournamentFinished = (() => {
                if (maxPlayersVal === 2 && matchIdLocal === 15) return true;
                if (maxPlayersVal === 4 && (matchIdLocal === 15 || matchIdLocal === 21)) {
                    const has15 = dbMatches.some(dm => dm.matchIndex === 15 || dm.winner) || matchIdLocal === 15;
                    const has21 = dbMatches.some(dm => dm.matchIndex === 21) || matchIdLocal === 21;
                    return has15 && has21;
                }
                if (maxPlayersVal === 8 && (matchIdLocal === 15 || matchIdLocal === 25)) {
                    const has15 = dbMatches.some(dm => dm.matchIndex === 15) || matchIdLocal === 15;
                    const has25 = dbMatches.some(dm => dm.matchIndex === 25) || matchIdLocal === 25;
                    return has15 && has25;
                }
                if (maxPlayersVal === 16 && matchIdLocal === 15) return true;
                return false;
            })();

            if (isTournamentFinished) {
                try {
                    await tournamentService.update(gameId, { status: 'completed' });
                    console.log("🏆 Tournament status auto-updated to completed in DB!");

                    // Compute final standings using latest matches
                    const finalStandings = generateStandings(
                        matchIdLocal === 15 ? finalMatches.map(m => m.id === 15 ? { ...m, winner: actualWinnerName } : m) : finalMatches,
                        (matchIdLocal >= 21 && matchIdLocal <= 25) ? losersMatches.map(m => m.id === matchIdLocal ? { ...m, winner: actualWinnerName } : m) : losersMatches
                    );

                    const standingsPayload = finalStandings.map(s => {
                        const user = allUsers.find(u => u.username === s.team);
                        return {
                            userId: user ? user._id : null,
                            rank: s.rank
                        };
                    }).filter(p => p.userId);

                    await leaderboardService.submitTournamentStandings({
                        game: tournament ? tournament.game : 'General',
                        standings: standingsPayload
                    });
                    console.log("🚀 Leaderboard final standings synchronized successfully!");
                } catch (updateErr) {
                    console.error("Failed auto-updating tournament status/leaderboard:", updateErr.message);
                }
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

            // Fetch new details to reload matches from backend
            fetchDetails();
        } catch (err) {
            console.error("Match sync failed:", err.message);
            error("Action failed. Make sure match-service and leaderboard-service are running.");
        }
    };

    const availableUsers = allUsers.filter(u => {
        return tournament && tournament.players && !tournament.players.includes(u._id);
    });

    const maxPlayersVal = tournament ? (parseInt(tournament.maxPlayers, 10) || 16) : 16;
    const minWidthVal = maxPlayersVal === 2 ? '300px' : maxPlayersVal === 4 ? '600px' : maxPlayersVal === 8 ? '800px' : '1000px';

    // Generate Standings Data dynamically based on match states
    const generateStandings = (customFinal = null, customLosers = null) => {
        const stats = {};
        const allPlayedMatches = [
            ...roundOf16Matches,
            ...quarterMatches,
            ...semiMatches,
            ...(customFinal || finalMatches),
            ...(customLosers || losersMatches)
        ];
        
        allPlayedMatches.forEach(m => {
            if (m.winner) {
                // Team A
                if (m.teamA && m.teamA !== 'TBD') {
                    if (!stats[m.teamA]) stats[m.teamA] = { team: m.teamA, mp: 0, w: 0, l: 0 };
                    stats[m.teamA].mp += 1;
                    if (m.winner === m.teamA) stats[m.teamA].w += 1;
                    else stats[m.teamA].l += 1;
                }
                // Team B
                if (m.teamB && m.teamB !== 'TBD') {
                    if (!stats[m.teamB]) stats[m.teamB] = { team: m.teamB, mp: 0, w: 0, l: 0 };
                    stats[m.teamB].mp += 1;
                    if (m.winner === m.teamB) stats[m.teamB].w += 1;
                    else stats[m.teamB].l += 1;
                }
            }
        });

        // Add registered players who haven't played yet
        if (tournament && tournament.players) {
            tournament.players.forEach(pid => {
                const u = allUsers.find(user => user._id === pid);
                const uname = u ? u.username : `Player_${pid.slice(-4)}`;
                if (!stats[uname]) {
                    stats[uname] = { team: uname, mp: 0, w: 0, l: 0 };
                }
            });
        }

        // Determine exact positions based on double-elimination bracket progression
        const positions = {};

        const m15 = finalMatches.find(f => f.id === 15);
        const m25 = losersMatches.find(l => l.id === 25);
        const m24 = losersMatches.find(l => l.id === 24);
        const m23 = losersMatches.find(l => l.id === 23);
        const m22 = losersMatches.find(l => l.id === 22);
        const m21 = losersMatches.find(l => l.id === 21);

        if (maxPlayersVal === 8) {
            // Rank 1 & 2
            if (m15 && m15.winner && m15.winner !== 'TBD') {
                positions[m15.winner] = 1;
                const loser15 = m15.winner === m15.teamA ? m15.teamB : m15.teamA;
                if (loser15 && loser15 !== 'TBD') positions[loser15] = 2;
            }

            // Rank 3 & 4
            if (m25 && m25.winner && m25.winner !== 'TBD') {
                positions[m25.winner] = 3;
                const loser25 = m25.winner === m25.teamA ? m25.teamB : m25.teamA;
                if (loser25 && loser25 !== 'TBD') positions[loser25] = 4;
            }

            // Rank 5 & 6
            if (m23 && m23.winner && m23.winner !== 'TBD') {
                const loser23 = m23.winner === m23.teamA ? m23.teamB : m23.teamA;
                if (loser23 && loser23 !== 'TBD') positions[loser23] = 5;
            }
            if (m24 && m24.winner && m24.winner !== 'TBD') {
                const loser24 = m24.winner === m24.teamA ? m24.teamB : m24.teamA;
                if (loser24 && loser24 !== 'TBD') positions[loser24] = 6;
            }

            // Rank 7 & 8
            if (m21 && m21.winner && m21.winner !== 'TBD') {
                const loser21 = m21.winner === m21.teamA ? m21.teamB : m21.teamA;
                if (loser21 && loser21 !== 'TBD') positions[loser21] = 7;
            }
            if (m22 && m22.winner && m22.winner !== 'TBD') {
                const loser22 = m22.winner === m22.teamA ? m22.teamB : m22.teamA;
                if (loser22 && loser22 !== 'TBD') positions[loser22] = 8;
            }
        } else if (maxPlayersVal === 4) {
            // Rank 1 & 2
            if (m15 && m15.winner && m15.winner !== 'TBD') {
                positions[m15.winner] = 1;
                const loser15 = m15.winner === m15.teamA ? m15.teamB : m15.teamA;
                if (loser15 && loser15 !== 'TBD') positions[loser15] = 2;
            }

            // Rank 3 & 4
            if (m21 && m21.winner && m21.winner !== 'TBD') {
                positions[m21.winner] = 3;
                const loser21 = m21.winner === m21.teamA ? m21.teamB : m21.teamA;
                if (loser21 && loser21 !== 'TBD') positions[loser21] = 4;
            }
        }

        // Convert to array and calculate win rate
        const standingsArr = Object.values(stats).map(s => {
            const wr = s.mp > 0 ? Math.round((s.w / s.mp) * 100) : 0;
            const rankPos = positions[s.team];
            return { ...s, wr: `${wr}%`, rankPos };
        });

        // Sort by bracket position if available, else fallback to wins and matches played
        standingsArr.sort((a, b) => {
            if (a.rankPos !== undefined && b.rankPos !== undefined) {
                return a.rankPos - b.rankPos;
            }
            if (a.rankPos !== undefined) return -1;
            if (b.rankPos !== undefined) return 1;

            if (b.w !== a.w) return b.w - a.w; 
            if (a.mp !== b.mp) return a.mp - b.mp; 
            return parseInt(b.wr) - parseInt(a.wr);
        });

        // Assign ranks
        return standingsArr.map((s, idx) => ({ ...s, rank: idx + 1 }));
    };

    const standingsData = generateStandings();

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
                background: 'linear-gradient(90deg, rgba(255, 85, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
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
                            {tournament && tournament.competitorType === 'teams' ? 'Teams Joined' : 'Players Joined'}: {playersCount} / {tournament ? tournament.maxPlayers : '16'}
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
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Quick Add {tournament && tournament.competitorType === 'teams' ? 'Team' : 'Player'}:</span>
                            <div style={{ position: 'relative', minWidth: '150px' }} ref={quickAddDropdownRef}>
                                <div 
                                    onClick={() => setIsQuickAddDropdownOpen(!isQuickAddDropdownOpen)}
                                    style={{ 
                                        background: 'rgba(12, 8, 34, 0.8)', 
                                        border: '1px solid var(--border-glass)', 
                                        borderRadius: '4px', 
                                        color: '#fff', 
                                        padding: '4px 8px',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span>
                                        {selectedQuickAddUser 
                                            ? (availableUsers.find(u => u._id === selectedQuickAddUser)?.username || '-- Select --') 
                                            : '-- Select --'}
                                    </span>
                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: isQuickAddDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                                {isQuickAddDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        marginTop: '6px',
                                        background: '#0d0d0d',
                                        border: '1px solid var(--border-glass-hover)',
                                        borderRadius: '6px',
                                        padding: '4px 0',
                                        zIndex: 1000,
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                                        maxHeight: '150px',
                                        overflowY: 'auto'
                                    }}>
                                        <div
                                            onClick={() => {
                                                setSelectedQuickAddUser('');
                                                setIsQuickAddDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                color: !selectedQuickAddUser ? 'var(--color-cyan)' : 'var(--text-main)',
                                                background: !selectedQuickAddUser ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                                transition: 'var(--transition-smooth)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = !selectedQuickAddUser ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                        >
                                            -- Select --
                                        </div>
                                        {availableUsers.map(user => (
                                            <div
                                                key={user._id}
                                                onClick={() => {
                                                    setSelectedQuickAddUser(user._id);
                                                    setIsQuickAddDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    color: selectedQuickAddUser === user._id ? 'var(--color-cyan)' : 'var(--text-main)',
                                                    background: selectedQuickAddUser === user._id ? 'rgba(255, 85, 0, 0.08)' : 'transparent',
                                                    transition: 'var(--transition-smooth)'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = selectedQuickAddUser === user._id ? 'rgba(255, 85, 0, 0.08)' : 'transparent'}
                                            >
                                                {user.username}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                                Losers Bracket
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
                            {selectedStage === 'winners' && (
                                <>
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
                                                    background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.1) 0%, rgba(255, 120, 0, 0.05) 100%)',
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
                                </>
                            )}

                            {selectedStage === 'losers' && maxPlayersVal === 8 && (
                                <>
                                    {/* Column 1: Losers Round 1 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minWidth: '220px' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                            Losers Round 1
                                        </h3>
                                        {losersMatches.filter(m => m.id === 21 || m.id === 22).map(m => (
                                            <div 
                                                key={m.id} 
                                                onClick={() => handleSimulateMatch(m.id, `Losers Round 1 (Match ${m.id - 20})`, m.teamA, m.teamB)}
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

                                    {/* Column 2: Losers Round 2 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minWidth: '220px' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                            Losers Round 2
                                        </h3>
                                        {losersMatches.filter(m => m.id === 23 || m.id === 24).map(m => (
                                            <div 
                                                key={m.id} 
                                                onClick={() => handleSimulateMatch(m.id, `Losers Round 2 (Match ${m.id - 22})`, m.teamA, m.teamB)}
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

                                    {/* Column 3: Losers Final */}
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', flex: 1, minWidth: '220px' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                            Losers Final
                                        </h3>
                                        {losersMatches.filter(m => m.id === 25).map(m => (
                                            <div 
                                                key={m.id} 
                                                onClick={() => handleSimulateMatch(m.id, 'Losers Final', m.teamA, m.teamB)}
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.1) 0%, rgba(255, 120, 0, 0.05) 100%)',
                                                    border: '1px solid var(--color-cyan)',
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
                                </>
                            )}

                            {selectedStage === 'losers' && maxPlayersVal === 4 && (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', flex: 1, minWidth: '220px' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                                        Losers Final
                                    </h3>
                                    {losersMatches.filter(m => m.id === 21).map(m => (
                                        <div 
                                            key={m.id} 
                                            onClick={() => handleSimulateMatch(m.id, 'Losers Final', m.teamA, m.teamB)}
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.1) 0%, rgba(255, 120, 0, 0.05) 100%)',
                                                border: '1px solid var(--color-cyan)',
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
                        </div>

                        {/* Dynamic Third Place playoff */}
                        {maxPlayersVal >= 4 && selectedStage === 'winners' && (
                            <div style={{
                                borderTop: '1px solid var(--border-glass)',
                                paddingTop: '25px',
                                marginTop: '15px'
                            }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Third place play-off</h4>
                                {(() => {
                                    const m3 = maxPlayersVal === 4 ? losersMatches.find(l => l.id === 21) : losersMatches.find(l => l.id === 25);
                                    if (!m3) return null;
                                    return (
                                        <div 
                                            onClick={() => handleSimulateMatch(m3.id, 'Losers Final (3rd Place Playoff)', m3.teamA, m3.teamB)}
                                            style={{
                                                width: '280px',
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m3.winner === m3.teamA ? '#fff' : 'var(--text-muted)', fontWeight: m3.winner === m3.teamA ? '700' : '400' }}>
                                                <span>🥉 {m3.teamA}</span>
                                                <span>{m3.scoreA !== null ? m3.scoreA : '-'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: m3.winner === m3.teamB ? '#fff' : 'var(--text-muted)', fontWeight: m3.winner === m3.teamB ? '700' : '400' }}>
                                                <span>🥉 {m3.teamB}</span>
                                                <span>{m3.scoreB !== null ? m3.scoreB : '-'}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
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
                            {standingsData.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No players registered yet.</td>
                                </tr>
                            )}
                            {standingsData.map((team) => (
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
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)',
                    fontFamily: "var(--font-family)"
                }}>
                    <div className="glass-panel" style={{
                        width: '600px',
                        padding: '30px',
                        position: 'relative',
                        border: '1px solid rgba(255, 85, 0, 0.25)',
                        boxShadow: '0 0 40px rgba(255, 85, 0, 0.15)'
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

                        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: '#ffffff' }}>
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
                                    <span style={{ color: 'var(--color-cyan)', fontWeight: 'bold' }}>{getTelemetryId(tournament?.game)}</span>
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
                                <div style={{ background: 'rgba(255, 85, 0, 0.04)', border: '1px solid rgba(255, 85, 0, 0.15)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
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
