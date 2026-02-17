import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import '../styles/polls.css';

export default function PollList() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || storedUser.role !== 'user') {
            navigate('/login');
            return;
        }

        setUser(storedUser);
        fetchPolls();
    }, [navigate]);

    const fetchPolls = async () => {
        try {
            setLoading(true);
            // Get active polls for users (based on scheduling)
            const response = await apiClient.get('/polls/user/active');
            setPolls(response.data.polls || []);
            setError('');
        } catch (err) {
            setError('Failed to load polls');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading">Loading polls...</div>;

    return (
        <div className="polls-container">
            <header className="polls-header">
                <h1>Available Polls</h1>
                <div>
                    <span>Welcome, {user?.email} (Student)</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            {polls.length === 0 ? (
                <div className="no-polls">
                    <p>No active polls available at this time</p>
                </div>
            ) : (
                <div className="polls-grid">
                    {polls.map(poll => (
                        <div key={poll.id} className="poll-card">
                            <h3>{poll.question}</h3>
                            <p className="poll-date">
                                Created: {new Date(poll.created_at).toLocaleDateString()}
                            </p>
                            {poll.start_time && (
                                <p className="poll-time">
                                    Opens: {new Date(poll.start_time).toLocaleString()}
                                </p>
                            )}
                            {poll.end_time && (
                                <p className="poll-time">
                                    Closes: {new Date(poll.end_time).toLocaleString()}
                                </p>
                            )}
                            <button
                                className="vote-btn"
                                onClick={() => navigate(`/vote/${poll.id}`)}
                            >
                                View Poll →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
