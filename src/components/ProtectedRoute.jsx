import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const isAuthenticated = requireAdmin 
    ? localStorage.getItem('adminAuth') === 'true'
    : true;

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? "/admin" : "/login"} replace />;
  }

  return children;
}