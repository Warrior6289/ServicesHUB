import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const items = [
    { name: 'Home', to: '/' },
    ...segments.map((seg, idx) => ({
      name: decodeURIComponent(seg.replace(/-/g, ' ')).replace(/\b\w/g, c => c.toUpperCase()),
      to: '/' + segments.slice(0, idx + 1).join('/'),
    })),
  ];

  return (
    <nav className="text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-slate-600 dark:text-slate-300">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.to} className="flex items-center gap-1">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span aria-current="page" className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
              ) : (
                <Link to={item.to} className="hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};


