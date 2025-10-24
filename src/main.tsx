import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index';
import './index.css';

// Debug logging
console.log('🚀 Services Hub: Starting app initialization...');

// Simple error boundary for the entire app
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 App Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 App Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🚨 Services Hub Error
            </h1>
            <p className="text-gray-600 mb-4">
              Something went wrong. Please refresh the page.
            </p>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Check if root element exists
const rootElement = document.getElementById('root');
console.log('🔍 Root element found:', !!rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  // Create a fallback display
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: white; font-family: Arial, sans-serif;">
      <div style="text-align: center; max-width: 400px; padding: 20px;">
        <h1 style="color: #333; margin-bottom: 20px;">🚨 Services Hub - Critical Error</h1>
        <p style="color: #666; margin-bottom: 20px;">Root element not found. This is a critical error.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 5px; cursor: pointer;">
          🔄 Refresh Page
        </button>
      </div>
    </div>
  `;
  throw new Error('Root element with id "root" not found');
}

// Simple app without complex dependencies
const SimpleApp = () => {
  console.log('🎯 Rendering SimpleApp component...');
  
  try {
    return (
      <AppErrorBoundary>
        <RouterProvider router={router} />
      </AppErrorBoundary>
    );
  } catch (error) {
    console.error('🚨 Error in SimpleApp:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🚨 Services Hub - Render Error
          </h1>
          <p className="text-gray-600 mb-4">
            Failed to render the app. Please refresh.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

console.log('🎨 Creating React root and rendering...');

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('🚨 Failed to render app:', error);
  
  // Fallback HTML
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: white; font-family: Arial, sans-serif;">
      <div style="text-align: center; max-width: 400px; padding: 20px;">
        <h1 style="color: #333; margin-bottom: 20px;">🚨 Services Hub - Render Failed</h1>
        <p style="color: #666; margin-bottom: 20px;">Failed to render React app. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 5px; cursor: pointer;">
          🔄 Refresh Page
        </button>
      </div>
    </div>
  `;
}