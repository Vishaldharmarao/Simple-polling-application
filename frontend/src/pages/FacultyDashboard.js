/**
 * Faculty Dashboard
 * Faculty can create and manage polls with scheduling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import '../styles/faculty.css';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [polls, setPolls] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        question: '',
        options: ['', ''],
        startTime: '',
        endTime: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Get current user
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'faculty') {
            navigate('/login');
            return;
        }
        setUser(storedUser);

        // Fetch faculty's polls
        fetchPolls(storedUser.id);
    }, [navigate]);

    const fetchPolls = async (facultyId) => {
        try {
            setLoading(true);
            const response = await API.get('/polls/faculty/my-polls', {
                headers: { 'X-User-ID': facultyId }
            });
            setPolls(response.data.polls);
            setError('');
        } catch (err) {
            setError('Failed to load polls');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, '']
        }));
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }));
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Validate form
            if (!formData.question.trim()) {
                setError('Question is required');
                return;
            }

            const validOptions = formData.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                setError('At least 2 options are required');
                return;
            }

            if (formData.startTime && formData.endTime) {
                const start = new Date(formData.startTime);
                const end = new Date(formData.endTime);
                if (start >= end) {
                    setError('Start time must be before end time');
                    return;
                }
            }

            const response = await API.post('/polls', {
                question: formData.question,
                options: validOptions,
                startTime: formData.startTime || null,
                endTime: formData.endTime || null,
                userId: user.id
            });

            setSuccess(`Poll created successfully! Poll ID: ${response.data.pollId}`);
            setFormData({
                question: '',
                options: ['', ''],
                startTime: '',
                endTime: ''
            });
            setShowCreateForm(false);

            // Refresh polls list
            fetchPolls(user.id);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create poll');
        }
    };

    const handleDeletePoll = async (pollId) => {
        if (window.confirm('Are you sure you want to delete this poll?')) {
            try {
                await API.delete(`/polls/${pollId}`, {
                    headers: { 'X-User-ID': user.id }
                });
                setSuccess('Poll deleted successfully');
                fetchPolls(user.id);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to delete poll');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return <div className="faculty-dashboard"><p>Loading...</p></div>;
    }

    return (
        <div className="faculty-dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <h1>Faculty Dashboard</h1>
                    <div className="nav-buttons">
                        <span className="welcome">Welcome, {user?.email}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="dashboard-header">
                    <h2>Your Polls</h2>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn btn-primary"
                    >
                        {showCreateForm ? 'Cancel' : '+ Create Poll'}
                    </button>
                </div>

                {showCreateForm && (
                    <form className="create-poll-form" onSubmit={handleCreatePoll}>
                        <div className="form-group">
                            <label htmlFor="question">Poll Question</label>
                            <input
                                id="question"
                                type="text"
                                name="question"
                                value={formData.question}
                                onChange={handleInputChange}
                                placeholder="Enter poll question"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Poll Options</label>
                            {formData.options.map((option, index) => (
                                <div key={index} className="option-input">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="btn-remove"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addOption}
                                className="btn btn-secondary btn-small"
                            >
                                + Add Option
                            </button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="startTime">Start Time (Optional)</label>
                                <input
                                    id="startTime"
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endTime">End Time (Optional)</label>
                                <input
                                    id="endTime"
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Create Poll
                        </button>
                    </form>
                )}

                <div className="polls-list">
                    {polls.length === 0 ? (
                        <p className="no-polls">You haven't created any polls yet.</p>
                    ) : (
                        polls.map(poll => (
                            <div key={poll.id} className="poll-card">
                                <div className="poll-header">
                                    <h3>{poll.question}</h3>
                                    <span className="poll-status">
                                        {poll.is_active ? '🔵 Active' : '⭕ Inactive'}
                                    </span>
                                </div>
                                
                                <div className="poll-stats">
                                    <p className="response-count">
                                        <strong>Student Responses: {poll.totalVotes || 0}</strong>
                                    </p>
                                </div>
                                
                                {poll.votingStats && poll.votingStats.results && poll.votingStats.results.length > 0 ? (
                                    <div className="poll-results">
                                        {poll.votingStats.results.map(result => (
                                            <div key={result.id} className="result-bar">
                                                <div className="result-label">
                                                    <span className="option-text">{result.text}</span>
                                                    <span className="result-count">{result.votes} ({result.percentage}%)</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{width: `${result.percentage}%`}}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                                
                                <div className="poll-meta">
                                    <p>Created: {new Date(poll.created_at).toLocaleString()}</p>
                                    {poll.start_time && (
                                        <p>Starts: {new Date(poll.start_time).toLocaleString()}</p>
                                    )}
                                    {poll.end_time && (
                                        <p>Ends: {new Date(poll.end_time).toLocaleString()}</p>
                                    )}
                                </div>
                                <div className="poll-actions">
                                    <button
                                        onClick={() => navigate(`/polls/${poll.id}`)}
                                        className="btn btn-secondary btn-small"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleDeletePoll(poll.id)}
                                        className="btn btn-danger btn-small"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
