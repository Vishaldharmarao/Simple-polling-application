import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollService } from '../services/api';
import '../styles/admin.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('view');
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [pollResults, setPollResults] = useState(null);

    // Form states
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const response = await pollService.getAllPolls();
            setPolls(response.data.polls || []);
            setError('');
        } catch (err) {
            setError('Failed to load polls');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        
        if (!question || options.some(opt => !opt)) {
            setError('All fields are required');
            return;
        }

        try {
            setSubmitting(true);
            await pollService.createPoll(question, options, user.id);
            setQuestion('');
            setOptions(['', '']);
            setActiveTab('view');
            fetchPolls();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create poll');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePoll = async (pollId) => {
        if (window.confirm('Are you sure you want to delete this poll?')) {
            try {
                await pollService.deletePoll(pollId);
                fetchPolls();
            } catch (err) {
                setError('Failed to delete poll');
            }
        }
    };

    const handleTogglePoll = async (poll) => {
        try {
            await pollService.updatePoll(poll.id, poll.question, !poll.is_active);
            fetchPolls();
        } catch (err) {
            setError('Failed to update poll');
        }
    };

    const handleViewResults = async (poll) => {
        try {
            const response = await pollService.getPollResults(poll.id);
            setSelectedPoll(poll);
            setPollResults(response.data.data);
        } catch (err) {
            setError('Failed to load poll results');
        }
    };

    const handleResetVotes = async (pollId) => {
        if (window.confirm('Are you sure you want to reset all votes for this poll?')) {
            try {
                await pollService.resetVotes(pollId);
                if (selectedPoll && selectedPoll.id === pollId) {
                    handleViewResults(selectedPoll);
                }
                fetchPolls();
            } catch (err) {
                setError('Failed to reset votes');
            }
        }
    };

    const addOptionField = () => {
        setOptions([...options, '']);
    };

    const removeOptionField = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div>
                    <span>{user.email}</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="admin-content">
                <nav className="admin-nav">
                    <button
                        className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`}
                        onClick={() => setActiveTab('view')}
                    >
                        View Polls
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Poll
                    </button>
                </nav>

                <main className="admin-main">
                    {error && <div className="error-message">{error}</div>}

                    {activeTab === 'view' && (
                        <div className="tab-content">
                            <h2>All Polls</h2>
                            {polls.length === 0 ? (
                                <p>No polls created yet</p>
                            ) : (
                                <div className="polls-table-container">
                                    <table className="polls-table">
                                        <thead>
                                            <tr>
                                                <th>Question</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {polls.map(poll => (
                                                <tr key={poll.id}>
                                                    <td>{poll.question}</td>
                                                    <td>
                                                        <span className={`status ${poll.is_active ? 'active' : 'inactive'}`}>
                                                            {poll.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(poll.created_at).toLocaleDateString()}</td>
                                                    <td className="action-buttons">
                                                        <button
                                                            className="btn-small btn-results"
                                                            onClick={() => handleViewResults(poll)}
                                                        >
                                                            Results
                                                        </button>
                                                        <button
                                                            className="btn-small btn-toggle"
                                                            onClick={() => handleTogglePoll(poll)}
                                                        >
                                                            {poll.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            className="btn-small btn-reset"
                                                            onClick={() => handleResetVotes(poll.id)}
                                                        >
                                                            Reset Votes
                                                        </button>
                                                        <button
                                                            className="btn-small btn-delete"
                                                            onClick={() => handleDeletePoll(poll.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <div className="tab-content">
                            <h2>Create New Poll</h2>
                            <form onSubmit={handleCreatePoll} className="create-poll-form">
                                <div className="form-group">
                                    <label>Poll Question</label>
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="Enter poll question"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Options</label>
                                    {options.map((option, index) => (
                                        <div key={index} className="option-input-group">
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                required
                                            />
                                            {options.length > 2 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-option"
                                                    onClick={() => removeOptionField(index)}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn-add-option"
                                        onClick={addOptionField}
                                    >
                                        + Add Option
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Creating...' : 'Create Poll'}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>

            {selectedPoll && pollResults && (
                <div className="modal-overlay" onClick={() => setSelectedPoll(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedPoll(null)}>✕</button>
                        <h3>{selectedPoll.question}</h3>
                        <div className="results-detail">
                            <p className="total-votes">Total Votes: {pollResults.totalVotes}</p>
                            <div className="results-list">
                                {pollResults.results.map(result => (
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
                    </div>
                </div>
            )}
        </div>
    );
}
