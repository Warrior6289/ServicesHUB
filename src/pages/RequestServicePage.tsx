import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ServiceRequestForm } from '../components/ServiceRequestForm';
// import { createInstantRequest, createScheduledRequest } from '../api/serviceRequests';
import type { ServiceRequest } from '../types/serviceRequest';
import { getMockUserRequests } from '../mocks/serviceRequests';

export const RequestServicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);

  const categoryParam = searchParams.get('category');
  const categoryIdParam = searchParams.get('categoryId');

  const initialCategory = categoryParam ? {
    id: categoryIdParam || categoryParam.toLowerCase(),
    name: categoryParam,
  } : undefined;

  useEffect(() => {
    // Fetch recent requests
    const fetchRecent = async () => {
      try {
        // Use mock data for now
        const data = getMockUserRequests(3);
        setRecentRequests(data);
      } catch (error) {
        // Handle recent requests fetch error
      }
    };

    fetchRecent();
  }, []);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      let result: ServiceRequest;

      if (data.type === 'instant') {
        // Create instant request
        const payload = {
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          description: data.description,
          price: data.price,
          location: data.location,
          broadcastRadius: data.broadcastRadius || 10,
        };

        // For development, simulate API call
        // Creating instant request
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock response
        result = {
          id: `req_${Date.now()}`,
          buyerId: 'current_user',
          buyerName: 'You',
          buyerLocation: payload.location,
          categoryId: payload.categoryId,
          categoryName: payload.categoryName,
          type: 'instant',
          status: 'pending',
          description: payload.description,
          initialPrice: payload.price,
          currentPrice: payload.price,
          priceHistory: [{ price: payload.price, timestamp: new Date().toISOString() }],
          broadcastRadius: payload.broadcastRadius,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // In production, use: result = await createInstantRequest(payload);
      } else {
        // Create scheduled request
        const payload = {
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          description: data.description,
          price: data.price,
          location: data.location,
          scheduledDate: data.scheduledDate,
          scheduledTimeSlot: data.scheduledTimeSlot,
          preferredSellerId: data.preferredSellerId,
        };

        // Creating scheduled request
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        result = {
          id: `req_${Date.now()}`,
          buyerId: 'current_user',
          buyerName: 'You',
          buyerLocation: payload.location,
          categoryId: payload.categoryId,
          categoryName: payload.categoryName,
          type: 'scheduled',
          status: 'pending',
          description: payload.description,
          initialPrice: payload.price,
          currentPrice: payload.price,
          priceHistory: [{ price: payload.price, timestamp: new Date().toISOString() }],
          scheduledDate: payload.scheduledDate,
          scheduledTimeSlot: payload.scheduledTimeSlot,
          preferredSellerId: payload.preferredSellerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // In production, use: result = await createScheduledRequest(payload);
      }

      // Success! Redirect to request details
      alert(`Request created successfully! Request ID: ${result.id}`);
      navigate(`/requests/${result.id}`);
    } catch (error) {
      // Handle request creation error
      alert('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Request a Service</h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Get help instantly or schedule for later. Choose what works best for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Your Request
              </h2>
              <ServiceRequestForm
                initialCategory={initialCategory}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Choose Request Type
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Instant for immediate help or scheduled for specific times
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Provide Details
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Describe your needs, set your price, and location
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Get Matched
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Service providers will accept your request
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Service Completed
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Professional completes the work and you can leave a review
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pricing Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-primary-50 dark:from-blue-900/20 dark:to-primary-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6"
            >
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                    Pricing Tips
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                    <li>• Set a fair price to attract quality providers</li>
                    <li>• You can boost the price if no one accepts</li>
                    <li>• Higher prices get faster responses</li>
                    <li>• Instant requests may cost more than scheduled</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Recent Requests */}
            {recentRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Your Recent Requests
                </h3>
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                      onClick={() => navigate(`/requests/${request.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {request.categoryName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ${request.currentPrice}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

