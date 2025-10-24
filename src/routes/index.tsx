import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../ui/AppLayout';
import { AuthProvider } from '../lib/auth';
import { RouteErrorBoundary } from '../ui/RouteErrorBoundary';
import { DashboardRedirect } from '../components/DashboardRedirect';
import React from 'react';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/HomePage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const SignupPage = React.lazy(() => import('../pages/SignupPage'));
const AdminPage = React.lazy(() => import('../pages/AdminPage'));
const UserDashboardPage = React.lazy(() => import('../pages/UserDashboardPage'));
const SellerDashboardPage = React.lazy(() => import('../pages/SellerDashboardPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const HowItWorksPage = React.lazy(() => import('../pages/HowItWorksPage'));
const PricingPage = React.lazy(() => import('../pages/PricingPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const HelpCenterPage = React.lazy(() => import('../pages/HelpCenterPage'));
const FAQPage = React.lazy(() => import('../pages/FAQPage'));
const TermsPage = React.lazy(() => import('../pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('../pages/PrivacyPage'));
const CookiesPage = React.lazy(() => import('../pages/CookiesPage'));
const RequestServicePage = React.lazy(() => import('../pages/RequestServicePage'));
const ServiceRequestDetailsPage = React.lazy(() => import('../pages/ServiceRequestDetailsPage'));

// Wrapper component that provides Auth context within Router context
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <AppLayout />
      </React.Suspense>
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
      { path: '/about', element: <AboutPage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/how-it-works', element: <HowItWorksPage /> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/help', element: <HelpCenterPage /> },
      { path: '/faq', element: <FAQPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/cookies', element: <CookiesPage /> },
      { path: '/admin', element: <AdminPage /> },
      { path: '/user-dashboard', element: <UserDashboardPage /> },
      { path: '/seller-dashboard', element: <SellerDashboardPage /> },
      { path: '/dashboard', element: <DashboardRedirect /> }, // Smart redirect based on role
      { path: '/profile', element: <ProfilePage /> },
      { path: '/request-service', element: <RequestServicePage /> },
      { path: '/requests/:id', element: <ServiceRequestDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);


