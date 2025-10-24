import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../ui/AppLayout';
import { RequireAdmin, AuthProvider } from '../lib/auth';
import { RouteErrorBoundary } from '../ui/RouteErrorBoundary';
import { DashboardRedirect } from '../components/DashboardRedirect';
import React from 'react';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = React.lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = React.lazy(() => import('../pages/SignupPage').then(m => ({ default: m.SignupPage })));
const AdminPage = React.lazy(() => import('../pages/AdminPage').then(m => ({ default: m.AdminPage })));
const UserDashboardPage = React.lazy(() => import('../pages/UserDashboardPage').then(m => ({ default: m.UserDashboardPage })));
const SellerDashboardPage = React.lazy(() => import('../pages/SellerDashboardPage').then(m => ({ default: m.SellerDashboardPage })));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AboutPage = React.lazy(() => import('../pages/AboutPage').then(m => ({ default: m.AboutPage })));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const HowItWorksPage = React.lazy(() => import('../pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const PricingPage = React.lazy(() => import('../pages/PricingPage').then(m => ({ default: m.PricingPage })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').then(m => ({ default: m.ContactPage })));
const HelpCenterPage = React.lazy(() => import('../pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const FAQPage = React.lazy(() => import('../pages/FAQPage').then(m => ({ default: m.FAQPage })));
const TermsPage = React.lazy(() => import('../pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = React.lazy(() => import('../pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const CookiesPage = React.lazy(() => import('../pages/CookiesPage').then(m => ({ default: m.CookiesPage })));
const RequestServicePage = React.lazy(() => import('../pages/RequestServicePage').then(m => ({ default: m.RequestServicePage })));
const ServiceRequestDetailsPage = React.lazy(() => import('../pages/ServiceRequestDetailsPage').then(m => ({ default: m.ServiceRequestDetailsPage })));

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
      { path: '/admin', element: (
        <RequireAdmin>
          <AdminPage />
        </RequireAdmin>
      ) },
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


