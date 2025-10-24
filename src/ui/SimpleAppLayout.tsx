import React from 'react';
import { Outlet } from 'react-router-dom';

export const SimpleAppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};
