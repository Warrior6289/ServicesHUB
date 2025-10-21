import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnimatePresence, motion } from 'framer-motion';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <main className={`flex-1 ${isHomePage ? '' : isAuthPage ? 'flex items-center justify-center px-4 py-8' : 'mx-auto max-w-6xl px-4 py-8'}`}>
        {!isHomePage && !isAuthPage && <Breadcrumbs />}
        <RouteTransitions>
          <Outlet />
        </RouteTransitions>
      </main>
      <Footer />
    </div>
  );
};

const RouteTransitions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};


