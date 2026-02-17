import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { formatDateTime } from '../utils/date';
import CreateUserModal from '../components/CreateUserModal';
import '../styles/user-management.css';

export default function AdminUserManagement() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [changeRoleModal, setChangeRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        setUser(storedUser);
        loadUsers(storedUser.id);
    }, [navigate]);

    const loadUsers = async (adminId) => {
        try {
            setLoading(true);
            setError('');
            const headers = { 'X-User-ID': adminId };
            const res = await API.get('/admin/users', { headers });
            setUsers(res.data.users);
            applyFilters(res.data.users);
        } catch (err) {
            setError('Failed to load users: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (userList) => {
        let filtered = userList;

        // Apply role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(u =>
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    };

    const handleFilterChange = (e) => {
        setRoleFilter(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        applyFilters(users);
    }, [roleFilter, searchTerm, users]);

    const handleCreateUser = async (formData) => {
        try {
            const headers = { 'X-User-ID': user.id };
            await API.post('/admin/users', formData, { headers });
            setSuccess('User created successfully!');
            setShowModal(false);
            loadUsers(user.id);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const headers = { 'X-User-ID': user.id };
            await API.delete(`/admin/users/${userId}`, { headers });
            setSuccess('User deleted successfully!');
            setDeleteConfirm(null);
            loadUsers(user.id);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleChangeRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            const headers = { 'X-User-ID': user.id };
            await API.put(
                `/admin/users/${selectedUser.id}/role`,
                { role: newRole },
                { headers }
            );
            setSuccess('User role updated successfully!');
            setChangeRoleModal(false);
            setSelectedUser(null);
            setNewRole('');
            loadUsers(user.id);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update role');
        }
    };

    const formatDate = (dateString) => formatDateTime(dateString);

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin':
                return 'badge-admin';
            case 'faculty':
                return 'badge-faculty';
            case 'student':
                return 'badge-student';
            default:
                return 'badge-default';
        }
    };

    return (
        <div className="user-management-container">
            {/* Header */}
            <div className="um-header">
                <div className="um-title-section">
                    <h1>User Management</h1>
                    <p className="um-subtitle">Manage students, faculty, and admin accounts</p>
                </div>
                <div className="um-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + Create New User
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-error">
                    {error}
                    <button className="alert-close" onClick={() => setError('')}>×</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    {success}
                    <button className="alert-close" onClick={() => setSuccess('')}>×</button>
                </div>
            )}

            {/* Filters */}
            <div className="um-filters">
                <div className="filter-group">
                    <label htmlFor="roleFilter">Filter by Role:</label>
                    <select
                        id="roleFilter"
                        value={roleFilter}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="all">All Users</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="search">Search Email:</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Enter email to search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="filter-input"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="um-table-container">
                {loading ? (
                    <div className="loading">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="no-data">
                        {users.length === 0 ? 'No users found' : 'No users match your filter'}
                    </div>
                ) : (
                    <>
                        <div className="um-table-wrapper">
                            <table className="um-table">
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
                                    {filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td className="td-id">{u.id}</td>
                                            <td className="td-email">{u.email}</td>
                                            <td className="td-role">
                                                <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                                                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="td-date">{formatDate(u.created_at)}</td>
                                            <td className="td-actions">
                                                {u.role !== 'admin' && (
                                                    <>
                                                        <button
                                                            className="btn-action btn-role"
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setNewRole(u.role === 'student' ? 'faculty' : 'student');
                                                                setChangeRoleModal(true);
                                                            }}
                                                            title="Change Role"
                                                        >
                                                            Change Role
                                                        </button>
                                                        <button
                                                            className="btn-action btn-delete"
                                                            onClick={() => setDeleteConfirm(u)}
                                                            title="Delete User"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                                {u.role === 'admin' && (
                                                    <span className="text-muted">Admin</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="um-table-footer">
                            <p>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users</p>
                        </div>
                    </>
                )}
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreateUser}
            />

            {/* Change Role Modal */}
            {changeRoleModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Change User Role</h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    setChangeRoleModal(false);
                                    setSelectedUser(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Change role for <strong>{selectedUser.email}</strong>?</p>
                            <p className="role-info">
                                Current role: <span className="badge">{selectedUser.role}</span>
                                <br />
                                New role: <span className="badge">{newRole}</span>
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setChangeRoleModal(false);
                                    setSelectedUser(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleChangeRole}
                            >
                                Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content modal-confirm">
                        <div className="modal-header">
                            <h2>Delete User</h2>
                            <button
                                className="modal-close"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this user?</p>
                            <p className="user-email"><strong>{deleteConfirm.email}</strong></p>
                            <p className="warning-text">This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteUser(deleteConfirm.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
