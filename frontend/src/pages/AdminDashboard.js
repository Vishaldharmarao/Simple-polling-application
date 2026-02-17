/**
 * Admin Dashboard
 * Manage users, faculty, admins, and view polls
 * Admin CANNOT create polls
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { formatDateTime } from '../utils/date';
import '../styles/admin.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    // Data states
    const [allUsers, setAllUsers] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [students, setStudents] = useState([]);
    const [polls, setPolls] = useState([]);

    // Form states
    const [createFacultyForm, setCreateFacultyForm] = useState({
        email: '',
        password: ''
    });
    const [createAdminForm, setCreateAdminForm] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        setUser(storedUser);
        loadData(storedUser.id);
    }, [navigate]);

    const loadData = async (adminId) => {
        try {
            setLoading(true);
            const headers = { 'X-User-ID': adminId };

            // Load all data in parallel
            const [usersRes, facultyRes, adminsRes, studentsRes, pollsRes] = await Promise.all([
                API.get('/admin/users', { headers }),
                API.get('/admin/faculty', { headers }),
                API.get('/admin/admins', { headers }),
                API.get('/admin/students', { headers }),
                API.get('/polls/admin/all-polls', { headers })
            ]);

            setAllUsers(usersRes.data.users || []);
            setFaculty(facultyRes.data.faculty || []);
            setAdmins(adminsRes.data.admins || []);
            setStudents(studentsRes.data.students || []);
            setPolls(pollsRes.data.polls || []);
            setError('');
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFaculty = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!createFacultyForm.email || !createFacultyForm.password) {
            setError('Email and password are required');
            return;
        }

        try {
            const response = await API.post('/auth/create-faculty', {
                email: createFacultyForm.email,
                password: createFacultyForm.password,
                userId: user.id
            });

            setSuccess(`Faculty account created! Email: ${response.data.email}`);
            setCreateFacultyForm({ email: '', password: '' });
            loadData(user.id);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create faculty account');
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!createAdminForm.email || !createAdminForm.password) {
            setError('Email and password are required');
            return;
        }

        try {
            const response = await API.post('/auth/create-admin', {
                email: createAdminForm.email,
                password: createAdminForm.password,
                userId: user.id
            });

            setSuccess(`Admin account created! Email: ${response.data.email}`);
            setCreateAdminForm({ email: '', password: '' });
            loadData(user.id);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create admin account');
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
            return;
        }

        try {
            setError('');
            await API.delete(`/admin/users/${userId}`, {
                headers: { 'X-User-ID': user.id }
            });

            setSuccess(`User ${userEmail} deleted successfully`);
            loadData(user.id);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return <div className="admin-dashboard"><p>Loading...</p></div>;
    }

    return (
        <div className="admin-dashboard">
            <nav className="navbar">
                <div className="navbar-container">
                    <h1>Admin Dashboard</h1>
                    <div className="nav-buttons">
                        <span className="welcome">Welcome, {user?.email}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        All Users ({allUsers.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
                        onClick={() => setActiveTab('faculty')}
                    >
                        Faculty ({faculty.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admins')}
                    >
                        Admins ({admins.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Students ({students.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
                        onClick={() => setActiveTab('polls')}
                    >
                        All Polls ({polls.length})
                    </button>
                </div>

                <div className="tab-content">
                    {/* All Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <h2>All Users</h2>
                            {allUsers.length === 0 ? (
                                <p>No users found</p>
                            ) : (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>{u.email}</td>
                                                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                                                <td>{formatDateTime(u.created_at)}</td>
                                                <td>
                                                    {u.role !== 'admin' && (
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Faculty Tab */}
                    {activeTab === 'faculty' && (
                        <div>
                            <h2>Faculty Members</h2>
                            {faculty.length === 0 ? (
                                <p>No faculty members found</p>
                            ) : (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faculty.map(f => (
                                            <tr key={f.id}>
                                                <td>{f.id}</td>
                                                <td>{f.email}</td>
                                                <td>{formatDateTime(f.created_at)}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteUser(f.id, f.email)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Admins Tab */}
                    {activeTab === 'admins' && (
                        <div>
                            <h2>Admin Accounts</h2>
                            {admins.length === 0 ? (
                                <p>No admins found</p>
                            ) : (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map(a => (
                                            <tr key={a.id}>
                                                <td>{a.id}</td>
                                                <td>{a.email}</td>
                                                <td>{formatDateTime(a.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div>
                            <h2>Student Accounts</h2>
                            {students.length === 0 ? (
                                <p>No students found</p>
                            ) : (
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.id}</td>
                                                <td>{s.email}</td>
                                                <td>{formatDateTime(s.created_at)}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteUser(s.id, s.email)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Create Users Tab */}
                    {activeTab === 'create' && (
                        <div className="create-users-section">
                            <div className="form-container">
                                <h2>Create Faculty Account</h2>
                                <form onSubmit={handleCreateFaculty}>
                                    <div className="form-group">
                                        <label htmlFor="faculty-email">Faculty Email</label>
                                        <input
                                            id="faculty-email"
                                            type="email"
                                            value={createFacultyForm.email}
                                            onChange={(e) => setCreateFacultyForm({
                                                ...createFacultyForm,
                                                email: e.target.value
                                            })}
                                            placeholder="faculty@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="faculty-password">Password</label>
                                        <input
                                            id="faculty-password"
                                            type="password"
                                            value={createFacultyForm.password}
                                            onChange={(e) => setCreateFacultyForm({
                                                ...createFacultyForm,
                                                password: e.target.value
                                            })}
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Create Faculty Account
                                    </button>
                                </form>
                            </div>

                            <div className="form-container">
                                <h2>Create Admin Account</h2>
                                <form onSubmit={handleCreateAdmin}>
                                    <div className="form-group">
                                        <label htmlFor="admin-email">Admin Email</label>
                                        <input
                                            id="admin-email"
                                            type="email"
                                            value={createAdminForm.email}
                                            onChange={(e) => setCreateAdminForm({
                                                ...createAdminForm,
                                                email: e.target.value
                                            })}
                                            placeholder="admin@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="admin-password">Password</label>
                                        <input
                                            id="admin-password"
                                            type="password"
                                            value={createAdminForm.password}
                                            onChange={(e) => setCreateAdminForm({
                                                ...createAdminForm,
                                                password: e.target.value
                                            })}
                                            placeholder="Enter password"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        Create Admin Account
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Polls Tab */}
                    {activeTab === 'polls' && (
                        <div>
                            <h2>All Polls with Student Responses</h2>
                            {polls.length === 0 ? (
                                <p>No polls found</p>
                            ) : (
                                <div className="polls-grid">
                                    {polls.map(poll => (
                                        <div key={poll.id} className="poll-card">
                                            <h3>{poll.question}</h3>
                                            <p><strong>Created by:</strong> User {poll.created_by}</p>
                                            <p><strong>Status:</strong> <span className={`status-badge ${poll.is_active ? 'active' : 'inactive'}`}>{poll.is_active ? 'Active' : 'Inactive'}</span></p>
                                            <p><strong>Total Responses:</strong> {poll.totalVotes || 0} students</p>
                                            
                                            {poll.votingStats && poll.votingStats.results && poll.votingStats.results.length > 0 ? (
                                                <div className="poll-results">
                                                    <h4>Student Responses:</h4>
                                                    {poll.votingStats.results.map(result => (
                                                        <div key={result.id} className="result-bar">
                                                            <div className="result-label">
                                                                <span>{result.text}</span>
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
                                            ) : (
                                                <p className="no-responses">No student responses yet</p>
                                            )}
                                            
                                            {poll.start_time && (
                                                <p className="poll-time"><strong>Starts:</strong> {formatDateTime(poll.start_time)}</p>
                                            )}
                                            {poll.end_time && (
                                                <p className="poll-time"><strong>Ends:</strong> {formatDateTime(poll.end_time)}</p>
                                            )}
                                            <p className="poll-date"><strong>Created:</strong> {formatDateTime(poll.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
