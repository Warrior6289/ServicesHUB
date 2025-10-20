import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../ui/AppLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AdminPage } from '../pages/AdminPage';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RequireAdmin, AuthProvider } from '../lib/auth';
import { RouteErrorBoundary } from '../ui/RouteErrorBoundary';
import React from 'react';

// Wrapper component that provides Auth context within Router context
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
};

export const router = createBrowserRouter([
  {
    element: <AppWithAuth />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/admin', element: (
        <RequireAdmin>
          <AdminPage />
        </RequireAdmin>
      ) },
      { path: '/user-dashboard', element: <UserDashboardPage /> },
      { path: '/seller-dashboard', element: <SellerDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);


