import React from 'react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const toggle = React.useCallback(() => {
    const root = document.documentElement;
    const next = !isDark;
    root.classList.toggle('dark', next);
    setIsDark(next);
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {isDark ? 'Light' : 'Dark'} Mode
    </button>
  );
};


