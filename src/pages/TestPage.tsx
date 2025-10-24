import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Services Hub
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Your React app is working perfectly!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          ✅ React Router is working correctly
        </div>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          ✅ Components are loading successfully
        </div>
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
          ✅ Deployment is successful
        </div>
      </div>
    </div>
  );
};

export default TestPage;
