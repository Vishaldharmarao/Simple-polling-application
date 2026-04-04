import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/vote.css';

export default function VotePage() {
    const { pollId } = useParams();
    const navigate = useNavigate();

    // Get user from localStorage
    const [user, setUser] = useState(null);
    const [poll, setPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Load user from localStorage
    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (!storedUser || !storedUser.id) {
                navigate('/login', { replace: true });
                return;
            }
            setUser(storedUser);
        } catch (error) {
            console.error('Error loading user:', error);
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Load poll data
    const loadPollData = useCallback(async () => {
        if (!user || !user.id || !pollId) return;

        try {
            setLoading(true);
            setError('');

            // Fetch all required data in parallel
            const [pollRes, voteRes, resultsRes] = await Promise.all([
                API.get(`/polls/${pollId}`),
                API.get(`/votes/check?userId=${user.id}&pollId=${pollId}`),
                API.get(`/polls/${pollId}/results`)
            ]);

            // Verify responses
            if (pollRes.data && pollRes.data.poll) {
                setPoll(pollRes.data.poll);
            } else {
                setError('Failed to load poll');
                return;
            }

            if (voteRes.data) {
                setHasVoted(voteRes.data.hasVoted || false);
            }

            if (resultsRes.data && resultsRes.data.data) {
                setResults(resultsRes.data.data);
            }
        } catch (err) {
            console.error('Error loading poll data:', err);
            const errorMsg = err.response?.data?.error || 'Failed to load poll details';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [user, pollId]);

    // Load poll data when component mounts or when refreshKey changes
    useEffect(() => {
        loadPollData();
    }, [loadPollData, refreshKey]);

    const handleVote = async () => {
        if (!selectedOption) {
            setError('Please select an option');
            return;
        }

        if (!user || !user.id) {
            setError('User not authenticated');
            navigate('/login', { replace: true });
            return;
        }

        try {
            setVoting(true);
            setError('');

            const response = await API.post('/votes', {
                userId: user.id,
                pollId: parseInt(pollId),
                optionId: parseInt(selectedOption)
            });

            if (response.data && response.data.success) {
                // Clear selected option
                setSelectedOption(null);

                // Update vote status immediately
                setHasVoted(true);

                // Refresh poll results after a short delay to get updated data
                setTimeout(() => {
                    setRefreshKey(prev => prev + 1);
                }, 300);
            } else {
                setError(response.data?.error || 'Failed to submit vote');
            }
        } catch (err) {
            console.error('Vote submission error:', err);
            const errorMsg = err.response?.data?.error || 'Failed to submit vote. Please try again.';
            setError(errorMsg);

            // Check if error is about already voting
            if (err.response?.data?.error?.includes('already voted')) {
                setHasVoted(true);
            }
        } finally {
            setVoting(false);
        }
    };

    if (!user) {
        return <div className="loading">Authenticating...</div>;
    }

    if (loading) {
        return <div className="loading">Loading poll...</div>;
    }

    if (!poll) {
        return (
            <div className="vote-container">
                <div className="error-message">Poll not found</div>
                <button onClick={() => navigate('/polls')} className="back-btn">
                    ← Back to Polls
                </button>
            </div>
        );
    }

    return (
        <div className="vote-container">
            <header className="vote-header">
                <button
                    onClick={() => navigate('/polls')}
                    className="back-btn"
                    aria-label="Back to polls"
                >
                    ← Back to Polls
                </button>
                <div>
                    <span>{user.email}</span>
                </div>
            </header>

            <div className="vote-card">
                <h2>{poll.question}</h2>

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

                {!hasVoted ? (
                    <div className="voting-section">
                        <h3>Select an option:</h3>
                        <div className="options-list">
                            {poll.options && poll.options.length > 0 ? (
                                poll.options.map(option => (
                                    <label key={option.id} className="option-label">
                                        <input
                                            type="radio"
                                            name="poll-option"
                                            value={option.id}
                                            checked={selectedOption === option.id}
                                            onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                                            disabled={voting || hasVoted}
                                            aria-label={option.option_text}
                                        />
                                        <span>{option.option_text}</span>
                                    </label>
                                ))
                            ) : (
                                <p>No options available</p>
                            )}
                        </div>
                        <button
                            className="submit-vote-btn"
                            onClick={handleVote}
                            disabled={voting || !selectedOption || hasVoted}
                            aria-label="Submit vote"
                        >
                            {voting ? 'Submitting...' : 'Submit Vote'}
                        </button>
                    </div>
                ) : (
                    <div className="voted-message">
                        <div className="success-checkmark">✓</div>
                        <p>You have already voted on this poll</p>
                    </div>
                )}

                {results && (
                    <div className="results-section">
                        <h3>Current Results ({results.totalVotes || 0} votes)</h3>
                        {results.results && results.results.length > 0 ? (
                            <div className="results-list">
                                {results.results.map(result => (
                                    <div key={result.id} className="result-item">
                                        <div className="result-info">
                                            <span className="result-text">{result.text}</span>
                                            <span className="result-count">
                                                {result.votes} vote{result.votes !== 1 ? 's' : ''} ({result.percentage}%)
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${parseFloat(result.percentage)}%` }}
                                                role="progressbar"
                                                aria-valuenow={parseFloat(result.percentage)}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-results">No votes yet</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
