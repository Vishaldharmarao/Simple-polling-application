import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollService, voteService } from '../services/api';
import '../styles/vote.css';

export default function VotePage() {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const [poll, setPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (!user.id) {
            navigate('/login');
            return;
        }
        loadPollData();
    }, [pollId]);

    const loadPollData = async () => {
        try {
            setLoading(true);
            const [pollRes, voteRes, resultsRes] = await Promise.all([
                pollService.getPollDetails(pollId),
                voteService.checkUserVote(user.id, pollId),
                pollService.getPollResults(pollId)
            ]);

            setPoll(pollRes.data.poll);
            setHasVoted(voteRes.data.hasVoted);
            setResults(resultsRes.data.data);
            setError('');
        } catch (err) {
            setError('Failed to load poll details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedOption) {
            setError('Please select an option');
            return;
        }

        try {
            setVoting(true);
            await voteService.submitVote(user.id, pollId, selectedOption);
            setHasVoted(true);
            setSelectedOption(null);
            
            // Refresh results
            setTimeout(() => loadPollData(), 500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit vote');
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <div className="loading">Loading poll...</div>;
    if (!poll) return <div className="error-message">Poll not found</div>;

    return (
        <div className="vote-container">
            <header className="vote-header">
                <button onClick={() => navigate('/polls')} className="back-btn">← Back to Polls</button>
                <div>
                    <span>{user.email}</span>
                </div>
            </header>

            <div className="vote-card">
                <h2>{poll.question}</h2>
                {error && <div className="error-message">{error}</div>}

                {!hasVoted ? (
                    <div className="voting-section">
                        <h3>Select an option:</h3>
                        <div className="options-list">
                            {poll.options.map(option => (
                                <label key={option.id} className="option-label">
                                    <input
                                        type="radio"
                                        name="poll-option"
                                        value={option.id}
                                        checked={selectedOption === option.id}
                                        onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                                        disabled={hasVoted}
                                    />
                                    <span>{option.option_text}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            className="submit-vote-btn"
                            onClick={handleVote}
                            disabled={voting || !selectedOption || hasVoted}
                        >
                            {voting ? 'Submitting...' : 'Submit Vote'}
                        </button>
                    </div>
                ) : (
                    <div className="voted-message">
                        ✓ You have already voted on this poll
                    </div>
                )}

                {results && (
                    <div className="results-section">
                        <h3>Current Results ({results.totalVotes} votes)</h3>
                        <div className="results-list">
                            {results.results.map(result => (
                                <div key={result.id} className="result-item">
                                    <div className="result-info">
                                        <span className="result-text">{result.text}</span>
                                        <span className="result-count">{result.votes} votes ({result.percentage}%)</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${result.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
