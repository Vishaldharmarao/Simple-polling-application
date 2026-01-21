import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Login from './pages/Login';
import Register from './pages/Register';
import PollList from './pages/PollList';
import VotePage from './pages/VotePage';
import AdminDashboard from './pages/AdminDashboard';
import ChangePassword from './pages/ChangePassword';

function App() {
    return (
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
    );
}

export default App;
