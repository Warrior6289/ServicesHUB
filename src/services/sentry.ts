// Temporarily disabled Sentry for build
export const initSentry = () => {
  console.log('Sentry initialization disabled');
};

export const captureException = (error: Error, context?: any) => {
  console.error('Error captured:', error, context);
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  console.log(`[${level.toUpperCase()}] ${message}`);
};

export const addBreadcrumb = (breadcrumb: any) => {
  console.log('Breadcrumb:', breadcrumb);
};

export const setUser = (user: any) => {
  console.log('User set:', user);
};

export const setContext = (key: string, context: any) => {
  console.log(`Context [${key}]:`, context);
};

export const setTag = (key: string, value: string) => {
  console.log(`Tag [${key}]:`, value);
};

export const setLevel = (level: string) => {
  console.log('Level set:', level);
};