import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import Login from './pages/Login';
import Register from './pages/Register';
import PollList from './pages/PollList';
import VotePage from './pages/VotePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import FacultyDashboard from './pages/FacultyDashboard';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Initialize auth state on app load
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData && userData.role) {
                    setUser(userData);
                    setUserRole(userData.role);
                }
            }
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Listen for storage changes (login/logout from same or other tabs)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                if (e.newValue) {
                    try {
                        const userData = JSON.parse(e.newValue);
                        setUser(userData);
                        setUserRole(userData.role);
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                        setUser(null);
                        setUserRole(null);
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            }
        };

        // Listen for custom login event from Login component
        const handleUserLogin = (e) => {
            setUser(e.detail);
            setUserRole(e.detail.role);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLogin', handleUserLogin);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLogin', handleUserLogin);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="loading">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    path="/polls"
                    element={
                        <ProtectedRoute allowedRoles={['user']} userRole={userRole}>
                            <PollList key={user?.id} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vote/:pollId"
                    element={
                        <ProtectedRoute allowedRoles={['user']} userRole={userRole}>
                            <VotePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                            <AdminUserManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']} userRole={userRole}>
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute allowedRoles={['user', 'faculty', 'admin']} userRole={userRole}>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route path="/" element={<Navigate to={userRole ? '/polls' : '/login'} replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
