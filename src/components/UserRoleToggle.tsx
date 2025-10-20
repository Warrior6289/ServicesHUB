import React from 'react';
import { useAuth } from '../lib/auth';

export const UserRoleToggle: React.FC = () => {
  const { role, loginAs } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const roles = [
    { value: 'buyer', label: 'Buyer', icon: '🛒', description: 'Find services' },
    { value: 'seller', label: 'Seller', icon: '🔧', description: 'Offer services' },
    { value: 'admin', label: 'Admin', icon: '⚙️', description: 'Manage platform' }
  ];

  const currentRole = roles.find(r => r.value === role);

  const handleRoleChange = (newRole: 'buyer' | 'seller' | 'admin') => {
    loginAs(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 transition-colors"
        aria-label="Switch user role"
      >
        <span className="text-lg">{currentRole?.icon}</span>
        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
          {currentRole?.label}
        </span>
        <svg 
          className={`w-4 h-4 text-primary-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="py-2">
            {roles.map((roleOption) => (
              <button
                key={roleOption.value}
                onClick={() => handleRoleChange(roleOption.value as 'buyer' | 'seller' | 'admin')}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                  role === roleOption.value ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <span className="text-lg">{roleOption.icon}</span>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {roleOption.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {roleOption.description}
                  </div>
                </div>
                {role === roleOption.value && (
                  <svg className="w-4 h-4 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
