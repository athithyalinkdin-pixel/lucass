import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Loading...</div>;
  }

  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
