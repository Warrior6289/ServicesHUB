import React from 'react';

type SkeletonProps = {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className ?? ''}`} />
  );
};

export const SkeletonText: React.FC<{ lines?: number } & SkeletonProps> = ({ lines = 3, className }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mt-2 first:mt-0">
          <Skeleton className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
        </div>
      ))}
    </div>
  );
};


