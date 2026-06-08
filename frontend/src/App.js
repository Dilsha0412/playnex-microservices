import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import LeaderboardPage from './pages/LeaderboardPage';
import OrganizerPage from './pages/OrganizerPage';
import BracketPage from './pages/BracketPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import ExternalGamePage from './pages/ExternalGamePage';
import { userService } from './services/api';

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <aside className="sidebar-area">
        <Sidebar />
      </aside>

      {/* Top Header Bar */}
      <div className="navbar-area">
        <Navbar />
      </div>

      {/* Main Routed Content Area */}
      <main className="main-content-area">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/organizer" element={<OrganizerPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/bracket/:gameId" element={<BracketPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/external-game" element={<ExternalGamePage />} />
          {/* Fallbacks */}
          <Route path="/tournaments" element={<Navigate to="/bracket/csgo" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('playnex_userId') || null);

  useEffect(() => {
    const resolveUser = async () => {
      try {
        console.log("🔍 Checking active user profiles...");
        const usersResponse = await userService.getAllUsers();
        
        let dilsha = usersResponse.data.find(u => u.username === 'Dilsha Jayasekara');
        let elife = usersResponse.data.find(u => u.username === 'Elife Yeon');

        if (!dilsha) {
          console.log("🆕 Registering default profile: Dilsha Jayasekara...");
          await userService.register({
            username: 'Dilsha Jayasekara',
            email: 'dilsha@gmail.com',
            password: 'password123'
          });
        }
        
        if (!elife) {
          console.log("🆕 Registering default profile: Elife Yeon...");
          await userService.register({
            username: 'Elife Yeon',
            email: 'elife@gmail.com',
            password: 'password123'
          });
        }

        if (!dilsha || !elife) {
          const reCheck = await userService.getAllUsers();
          dilsha = reCheck.data.find(u => u.username === 'Dilsha Jayasekara');
          elife = reCheck.data.find(u => u.username === 'Elife Yeon');
        }

        const existingUserId = localStorage.getItem('playnex_userId');
        if (existingUserId && !currentUserId) {
          setCurrentUserId(existingUserId);
        }
        if (elife) {
          localStorage.setItem('playnex_opponentId', elife._id);
        }
      } catch (err) {
        console.error("⚠️ Failed resolving user session:", err.message);
      }
    };
    resolveUser();
  }, [currentUserId]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;