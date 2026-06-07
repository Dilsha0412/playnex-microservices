import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/tournaments" element={
            <div style={{ padding: '30px' }}><h2>⚔️ Tournaments Page Coming Soon</h2></div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;