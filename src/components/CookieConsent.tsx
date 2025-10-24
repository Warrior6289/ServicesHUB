import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allPreferences));
    onAccept(allPreferences);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    onAccept(preferences);
    setIsVisible(false);
  };

  const handleDecline = () => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(minimalPreferences));
    onDecline();
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Cookie Preferences
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                You can choose which cookies to accept or decline.
              </p>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mb-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Necessary Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Essential for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Help us understand how visitors interact with our website.
                        </p>
                      </div>
                      <button
                        onClick={() => togglePreference('analytics')}
                        className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                          preferences.analytics ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.analytics ? 'translate-x-5' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Marketing Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Used to deliver personalized advertisements.
                        </p>
                      </div>
                      <button
                        onClick={() => togglePreference('marketing')}
                        className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                          preferences.marketing ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.marketing ? 'translate-x-5' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Preference Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Remember your preferences and settings.
                        </p>
                      </div>
                      <button
                        onClick={() => togglePreference('preferences')}
                        className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                          preferences.preferences ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          preferences.preferences ? 'translate-x-5' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
                <a
                  href="/privacy"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="/cookies"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Cookie Policy
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Accept Selected
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to manage cookie consent
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    }
  }, []);

  const handleAccept = (preferences: CookiePreferences) => {
    setConsent(preferences);
    
    // Initialize analytics if accepted
    if (preferences.analytics) {
      // Initialize Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    }

    // Initialize marketing cookies if accepted
    if (preferences.marketing) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
        });
      }
    }
  };

  const handleDecline = () => {
    const minimalConsent: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setConsent(minimalConsent);
  };

  return {
    consent,
    handleAccept,
    handleDecline,
    hasConsent: consent !== null,
  };
};

export default CookieConsent;
