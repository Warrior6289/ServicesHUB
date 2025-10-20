import React from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : (error instanceof Error ? error.message : 'Something went wrong');
  return (
    <div className="rounded-lg border p-6 dark:border-slate-700">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{message}</p>
      <button onClick={() => window.location.reload()} className="mt-4 rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700">Reload</button>
    </div>
  );
};


