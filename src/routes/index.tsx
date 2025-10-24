import { createBrowserRouter } from 'react-router-dom';
import { SimpleAppLayout } from '../ui/SimpleAppLayout';
import { AuthProvider } from '../lib/auth';
import { RouteErrorBoundary } from '../ui/RouteErrorBoundary';
import { DashboardRedirect } from '../components/DashboardRedirect';
import React from 'react';

// Lazy load pages for better performance
// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/TestPage').catch(() => ({ default: () => <div>Loading TestPage...</div> })));
const LoginPage = React.lazy(() => import('../pages/LoginPage').catch(() => ({ default: () => <div>Loading LoginPage...</div> })));
const SignupPage = React.lazy(() => import('../pages/SignupPage').catch(() => ({ default: () => <div>Loading SignupPage...</div> })));
const AdminPage = React.lazy(() => import('../pages/AdminPage').catch(() => ({ default: () => <div>Loading AdminPage...</div> })));
const UserDashboardPage = React.lazy(() => import('../pages/UserDashboardPage').catch(() => ({ default: () => <div>Loading UserDashboardPage...</div> })));
const SellerDashboardPage = React.lazy(() => import('../pages/SellerDashboardPage').catch(() => ({ default: () => <div>Loading SellerDashboardPage...</div> })));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage').catch(() => ({ default: () => <div>Loading ProfilePage...</div> })));
const AboutPage = React.lazy(() => import('../pages/AboutPage').catch(() => ({ default: () => <div>Loading AboutPage...</div> })));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage').catch(() => ({ default: () => <div>404 - Page Not Found</div> })));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage').catch(() => ({ default: () => <div>Loading ServicesPage...</div> })));
const HowItWorksPage = React.lazy(() => import('../pages/HowItWorksPage').catch(() => ({ default: () => <div>Loading HowItWorksPage...</div> })));
const PricingPage = React.lazy(() => import('../pages/PricingPage').catch(() => ({ default: () => <div>Loading PricingPage...</div> })));
const ContactPage = React.lazy(() => import('../pages/ContactPage').catch(() => ({ default: () => <div>Loading ContactPage...</div> })));
const HelpCenterPage = React.lazy(() => import('../pages/HelpCenterPage').catch(() => ({ default: () => <div>Loading HelpCenterPage...</div> })));
const FAQPage = React.lazy(() => import('../pages/FAQPage').catch(() => ({ default: () => <div>Loading FAQPage...</div> })));
const TermsPage = React.lazy(() => import('../pages/TermsPage').catch(() => ({ default: () => <div>Loading TermsPage...</div> })));
const PrivacyPage = React.lazy(() => import('../pages/PrivacyPage').catch(() => ({ default: () => <div>Loading PrivacyPage...</div> })));
const CookiesPage = React.lazy(() => import('../pages/CookiesPage').catch(() => ({ default: () => <div>Loading CookiesPage...</div> })));
const RequestServicePage = React.lazy(() => import('../pages/RequestServicePage').catch(() => ({ default: () => <div>Loading RequestServicePage...</div> })));
const ServiceRequestDetailsPage = React.lazy(() => import('../pages/ServiceRequestDetailsPage').catch(() => ({ default: () => <div>Loading ServiceRequestDetailsPage...</div> })));

// Wrapper component that provides Auth context within Router context
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Services Hub...</p>
          </div>
        </div>
      }>
        <SimpleAppLayout />
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


