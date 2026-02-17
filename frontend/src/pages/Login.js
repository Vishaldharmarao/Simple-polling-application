import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!email.trim() || !password.trim()) {
                setError('Email and password are required');
                setLoading(false);
                return;
            }

            // Make API call
            const response = await authService.login(email, password);

            // Verify response
            if (response && response.data && response.data.success) {
                const userData = response.data.user;

                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(userData));

                // Dispatch custom event to notify other components of login
                window.dispatchEvent(new CustomEvent('userLogin', { detail: userData }));

                // Clear form
                setEmail('');
                setPassword('');

                // Navigate based on role
                if (userData.role === 'admin') {
                    navigate('/admin-dashboard', { replace: true });
                } else if (userData.role === 'faculty') {
                    navigate('/faculty-dashboard', { replace: true });
                } else {
                    navigate('/polls', { replace: true });
                }
            } else {
                setError(response?.data?.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Login failed. Please try again.';
            setError(errorMsg);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Login</h1>
                <p>Sign in to your account</p>

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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <a href="/register">Register here</a>
                </div>
            </div>
        </div>
    );
}
