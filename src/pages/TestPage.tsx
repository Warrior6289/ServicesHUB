import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Services Hub Test Page
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          If you can see this, the React app is working!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ React Router is working correctly
        </div>
      </div>
    </div>
  );
};

export default TestPage;
