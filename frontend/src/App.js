import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Login from './pages/Login';
import Register from './pages/Register';
import PollList from './pages/PollList';
import VotePage from './pages/VotePage';
import AdminDashboard from './pages/AdminDashboard';
import ChangePassword from './pages/ChangePassword';

function App() {
    const [dark, setDark] = useState(() => {
        try {
            return localStorage.getItem('theme') === 'dark';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (dark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        } catch {}
    }, [dark]);

    return (
        <>
            <button
                className="theme-toggle"
                onClick={() => setDark((d) => !d)}
                title={dark ? 'Switch to light' : 'Switch to dark'}
            >
                {dark ? '🌙' : '☀️'}
            </button>

            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/polls" element={<PollList />} />
                    <Route path="/vote/:pollId" element={<VotePage />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
