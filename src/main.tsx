import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { initSentry } from './services/sentry';
import analyticsService from './services/analytics';
import CookieConsent, { useCookieConsent } from './components/CookieConsent';

// Initialize services
initSentry();
analyticsService.init();

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

// App component with cookie consent
const AppWithConsent = () => {
  const { handleAccept, handleDecline } = useCookieConsent();

  return (
    <>
      <RouterProvider router={router} />
      <CookieConsent onAccept={handleAccept} onDecline={handleDecline} />
    </>
  );
};

createRoot(rootElement).render(
  <React.StrictMode>
    <AppWithConsent />
  </React.StrictMode>
);


