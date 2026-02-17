import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import '../styles/polls.css';

export default function PollList() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    // Initialize user and check authentication
    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

            if (!storedUser || !storedUser.id || storedUser.role !== 'user') {
                navigate('/login', { replace: true });
                return;
            }

            setUser(storedUser);
        } catch (error) {
            console.error('Error loading user:', error);
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Fetch polls data
    const fetchPolls = useCallback(async () => {
        if (!user || !user.id) return;

        try {
            setLoading(true);
            setError('');

            // Get active polls for the user (based on scheduling)
            const response = await apiClient.get('/polls/user/active', {
                headers: {
                    'X-User-ID': user.id
                }
            });

            if (response.data && response.data.polls) {
                setPolls(Array.isArray(response.data.polls) ? response.data.polls : []);
            } else {
                setPolls([]);
            }
        } catch (err) {
            console.error('Error loading polls:', err);
            const errorMsg = err.response?.data?.error || 'Failed to load polls';
            setError(errorMsg);
            setPolls([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load polls when user is set or when refreshing
    useEffect(() => {
        fetchPolls();
    }, [fetchPolls, refreshKey]);

    // Listen for vote updates from other components
    useEffect(() => {
        const handleVoteSubmitted = () => {
            // Refresh the poll list after a vote is submitted
            setRefreshKey(prev => prev + 1);
        };

        window.addEventListener('voteSubmitted', handleVoteSubmitted);
        return () => window.removeEventListener('voteSubmitted', handleVoteSubmitted);
    }, []);

    // Handle logout
    const handleLogout = () => {
        try {
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('storage'));
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Handle poll refresh
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Handle navigate to poll
    const handleNavigateToPoll = (pollId) => {
        navigate(`/vote/${pollId}`);
    };

    if (!user) {
        return (
            <div className="loading">
                <div>Authenticating...</div>
            </div>
        );
    }

    return (
        <div className="polls-container">
            <header className="polls-header">
                <div className="polls-title-section">
                    <h1>Available Polls</h1>
                    <p className="polls-subtitle">Select a poll to vote</p>
                </div>
                <div className="polls-header-actions">
                    <span className="welcome-text">Welcome, {user?.email}</span>
                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        title="Refresh polls"
                        aria-label="Refresh polls"
                    >
                        🔄
                    </button>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button
                        className="alert-close"
                        onClick={() => setError('')}
                        aria-label="Close error"
                    >
                        ×
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <div>Loading polls...</div>
                </div>
            ) : polls.length === 0 ? (
                <div className="no-polls">
                    <p>No active polls available at this time</p>
                    <button
                        className="btn btn-secondary"
                        onClick={handleRefresh}
                    >
                        Refresh
                    </button>
                </div>
            ) : (
                <div className="polls-grid">
                    {polls.map(poll => (
                        <div key={poll.id} className="poll-card">
                            <div className="poll-card-header">
                                <h3>{poll.question}</h3>
                                {poll.is_active && (
                                    <span className="poll-status-badge">Active</span>
                                )}
                            </div>

                            <div className="poll-meta">
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
                            </div>

                            <button
                                className="vote-btn"
                                onClick={() => handleNavigateToPoll(poll.id)}
                                aria-label={`Vote on poll: ${poll.question}`}
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
