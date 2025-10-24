import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}`} />
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  className = ''
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative flex items-center justify-center ${className}`}
    >
      {isLoading && (
        <div className="absolute left-3">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={isLoading ? 'ml-6' : ''}>
        {isLoading ? (loadingText || 'Loading...') : children}
      </span>
    </button>
  );
};

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonLines?: number;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  isLoading,
  children,
  skeletonLines = 3,
  className = ''
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  );
};

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
}

// Higher-order component for adding loading states to async operations
export function withLoadingState<P extends object>(
  Component: React.ComponentType<P>,
  loadingPropName = 'isLoading'
) {
  return React.forwardRef<any, P & { [K in typeof loadingPropName]?: boolean }>((props, ref) => {
    const { [loadingPropName]: isLoading, ...restProps } = props as any;
    
    return (
      <LoadingOverlay isLoading={!!isLoading}>
        <Component {...(restProps as P)} ref={ref} />
      </LoadingOverlay>
    );
  });
}
