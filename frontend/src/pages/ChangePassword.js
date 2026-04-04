import React, { useState } from 'react';
import API from '../api';
import '../styles/ChangePassword.css';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthFeedback, setStrengthFeedback] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem('userId');

    // Check password strength
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);

        // Check strength via API
        if (password) {
            API
                .post('/password/check-strength', { password })
                .then((res) => {
                    setStrengthScore(res.data.score);
                    setStrengthFeedback(res.data.feedback);
                })
                .catch((err) => {
                    console.log('Error checking password strength:', err);
                });
        } else {
            setStrengthScore(0);
            setStrengthFeedback('');
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword === currentPassword) {
            setError('New password must be different from current password');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);

        // Send request to change password
        API
            .post('/password/change-password', {
                userId,
                currentPassword,
                newPassword,
            })
            .then((res) => {
                setMessage('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setStrengthScore(0);
                setStrengthFeedback('');
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.error || 'Failed to change password');
                setLoading(false);
            });
    };

    const getStrengthLabel = () => {
        if (strengthScore === 0) return '';
        if (strengthScore === 1) return 'Weak';
        if (strengthScore === 2) return 'Fair';
        if (strengthScore === 3) return 'Good';
        if (strengthScore === 4) return 'Strong';
    };

    const getStrengthColor = () => {
        if (strengthScore === 0) return '';
        if (strengthScore === 1) return 'weak';
        if (strengthScore === 2) return 'fair';
        if (strengthScore === 3) return 'good';
        if (strengthScore === 4) return 'strong';
    };

    return (
        <div className="change-password-container">
            <div className="change-password-box">
                <h2>Change Password</h2>

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            disabled={loading}
                        />
                        {newPassword && (
                            <div className={`password-strength strength-${getStrengthColor()}`}>
                                <span className="strength-label">{getStrengthLabel()}</span>
                                <span className="strength-bar">
                                    <span
                                        className="strength-fill"
                                        style={{
                                            width: `${(strengthScore / 4) * 100}%`,
                                        }}
                                    ></span>
                                </span>
                            </div>
                        )}
                        {strengthFeedback && <p className="strength-feedback">{strengthFeedback}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={loading}
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="mismatch-warning">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-change-password"
                        disabled={loading}
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </form>

                <p className="info-text">
                    ⚠️ Note: This application stores passwords in plain text for educational purposes only.
                    In production, always use bcrypt or similar hashing algorithms.
                </p>
            </div>
        </div>
    );
};

export default ChangePassword;
