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

    useEffect(() => {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user && user.role) {
            setUserRole(user.role);
        }
        setIsLoading(false);
    }, []);

    // Listen for storage changes (logout from other tabs)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                const user = JSON.parse(e.newValue || 'null');
                if (user && user.role) {
                    setUserRole(user.role);
                } else {
                    setUserRole(null);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
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
                            <PollList />
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
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
