import React from 'react';
import { NavLink } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">Page not found.</p>
      <NavLink to="/" className="mt-6 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Go Home</NavLink>
    </div>
  );
};


