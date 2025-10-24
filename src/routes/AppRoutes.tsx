import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorFallback from '../components/ErrorFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

const HomePage = lazy(() => import('../pages/HomePage').then(m => ({ default: m.default })));
const AboutPage = lazy(() => import('../pages/AboutPage').then(m => ({ default: m.default })));
const RequestServicePage = lazy(() => import('../pages/RequestServicePage').then(m => ({ default: m.default })));
const UserDashboardPage = lazy(() => import('../pages/UserDashboardPage').then(m => ({ default: m.default })));
const SellerDashboardPage = lazy(() => import('../pages/SellerDashboardPage').then(m => ({ default: m.default })));
const ServiceRequestDetailsPage = lazy(() => import('../pages/ServiceRequestDetailsPage').then(m => ({ default: m.default })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.default })));
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.default })));
const SignupPage = lazy(() => import('../pages/SignupPage').then(m => ({ default: m.default })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.default })));

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Add authentication check here
  return <>{children}</>;
};

// Public route wrapper
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PublicRoute>
                <AboutPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/request-service"
            element={
              <ProtectedRoute>
                <RequestServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-request/:id"
            element={
              <ProtectedRoute>
                <ServiceRequestDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
