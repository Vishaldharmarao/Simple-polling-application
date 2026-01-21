import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollService } from '../services/api';
import '../styles/polls.css';

export default function PollList() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.id) {
            navigate('/login');
            return;
        }
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const response = await pollService.getAllPolls(true);
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
                <h1>Polling Application</h1>
                <div>
                    <span>Welcome, {user.email}</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            {polls.length === 0 ? (
                <div className="no-polls">
                    <p>No active polls available</p>
                </div>
            ) : (
                <div className="polls-grid">
                    {polls.map(poll => (
                        <div key={poll.id} className="poll-card">
                            <h3>{poll.question}</h3>
                            <p className="poll-date">
                                Created: {new Date(poll.created_at).toLocaleDateString()}
                            </p>
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
