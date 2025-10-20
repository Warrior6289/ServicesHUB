import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

type Role = 'guest' | 'buyer' | 'seller' | 'admin';

type AuthState = {
  isAuthenticated: boolean;
  role: Role;
  loginAs: (role: Role) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<Role>(() => {
    // Initialize from localStorage
    const storedRole = localStorage.getItem('userRole') as Role;
    return storedRole || 'guest';
  });

  const value: AuthState = {
    isAuthenticated: role !== 'guest',
    role,
    loginAs: (next) => {
      setRole(next);
      localStorage.setItem('userRole', next);
    },
    logout: () => {
      setRole('guest');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userServices');
      localStorage.removeItem('userData');
      navigate('/login');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
