import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { UserRoleToggle } from './UserRoleToggle';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from './UserProfile';

export const Header: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { isAuthenticated, role, logout } = useAuth();
  
  return (
    <header className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900 sticky top-0 z-40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded bg-primary-600 px-3 py-1.5 text-white">Skip to content</a>
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-semibold tracking-wide text-primary-600 dark:text-primary-400">Services Hub</NavLink>
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="md:hidden inline-flex items-center rounded-md border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <nav className="hidden md:flex gap-4 items-center">
          <NavLink to="/" className={({ isActive }) => `transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${isActive ? 'text-primary-600 font-medium' : ''}`}>Home</NavLink>
          {isAuthenticated ? (
            <>
              <UserRoleToggle />
              {role === 'buyer' && <NavLink to="/user-dashboard" className={({ isActive }) => `transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${isActive ? 'text-primary-600 font-medium' : ''}`}>Dashboard</NavLink>}
              {role === 'seller' && <NavLink to="/seller-dashboard" className={({ isActive }) => `transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${isActive ? 'text-primary-600 font-medium' : ''}`}>Dashboard</NavLink>}
              {role === 'admin' && <NavLink to="/admin" className={({ isActive }) => `transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${isActive ? 'text-primary-600 font-medium' : ''}`}>Admin</NavLink>}
              <ThemeToggle />
              <UserProfile />
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${isActive ? 'text-primary-600 font-medium' : ''}`}>Login</NavLink>
              <NavLink to="/signup" className={({ isActive }) => `transition-colors duration-200 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${isActive ? 'text-primary-600 font-medium' : ''}`}>Sign Up</NavLink>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
      {open ? (
        <div className="md:hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
            <NavLink onClick={() => setOpen(false)} to="/" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Home</NavLink>
            {isAuthenticated ? (
              <>
                <div className="px-2 py-1">
                  <UserRoleToggle />
                </div>
                {role === 'buyer' && <NavLink onClick={() => setOpen(false)} to="/user-dashboard" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Dashboard</NavLink>}
                {role === 'seller' && <NavLink onClick={() => setOpen(false)} to="/seller-dashboard" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Dashboard</NavLink>}
                {role === 'admin' && <NavLink onClick={() => setOpen(false)} to="/admin" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Admin</NavLink>}
                <NavLink onClick={() => setOpen(false)} to="/request-service" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Request Service</NavLink>
                <div className="px-2 py-1">
                  <ThemeToggle />
                </div>
                <button onClick={() => { logout(); setOpen(false); }} className="rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-red-600 dark:text-red-400">Logout</button>
              </>
            ) : (
              <>
                <NavLink onClick={() => setOpen(false)} to="/login" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Login</NavLink>
                <NavLink onClick={() => setOpen(false)} to="/signup" className={({ isActive }) => `rounded px-2 py-1 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 ${isActive ? 'text-primary-600 font-medium' : ''}`}>Sign Up</NavLink>
                <div className="px-2 py-1">
                  <ThemeToggle />
                </div>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
};


