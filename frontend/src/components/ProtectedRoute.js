/**
 * Protected Route Component
 * Checks user role and restricts access based on allowed roles
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
    // If no user role, redirect to login
    if (!userRole) {
        return <Navigate to="/login" replace />;
    }

    // If user role is not in allowed roles, redirect to appropriate dashboard
    if (!allowedRoles.includes(userRole)) {
        if (userRole === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        } else if (userRole === 'faculty') {
            return <Navigate to="/faculty-dashboard" replace />;
        } else if (userRole === 'user') {
            return <Navigate to="/polls" replace />;
        } else {
            return <Navigate to="/login" replace />;
        }
    }

    // User has access
    return children;
};

export default ProtectedRoute;
