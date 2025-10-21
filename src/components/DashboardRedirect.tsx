import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export const DashboardRedirect: React.FC = () => {
  const { role } = useAuth();
  
  switch (role) {
    case 'buyer':
      return <Navigate to="/user-dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};
