import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../ui/AppLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AdminPage } from '../pages/AdminPage';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ServicesPage } from '../pages/ServicesPage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { PricingPage } from '../pages/PricingPage';
import { ContactPage } from '../pages/ContactPage';
import { HelpCenterPage } from '../pages/HelpCenterPage';
import { FAQPage } from '../pages/FAQPage';
import { TermsPage } from '../pages/TermsPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { CookiesPage } from '../pages/CookiesPage';
import { RequestServicePage } from '../pages/RequestServicePage';
import { ServiceRequestDetailsPage } from '../pages/ServiceRequestDetailsPage';
import { RequireAdmin, AuthProvider } from '../lib/auth';
import { RouteErrorBoundary } from '../ui/RouteErrorBoundary';
import { DashboardRedirect } from '../components/DashboardRedirect';
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
      { path: '/request-service', element: <RequestServicePage /> },
      { path: '/requests/:id', element: <ServiceRequestDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);


