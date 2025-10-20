import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RequestStatusTimeline } from '../components/RequestStatusTimeline';
import { PriceBoostModal } from '../components/PriceBoostModal';
// import { getRequestById, boostRequestPrice, cancelRequest } from '../api/serviceRequests';
import type { ServiceRequest } from '../types/serviceRequest';
import { mockServiceRequests } from '../mocks/serviceRequests';

export const ServiceRequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boosting, setBoosting] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Use mock data for development
        const mockRequest = mockServiceRequests.find(r => r.id === id);
        
        if (mockRequest) {
          setRequest(mockRequest);
        } else {
          // In production: const data = await getRequestById(id);
          throw new Error('Request not found');
        }
      } catch (error) {
        console.error('Failed to fetch request:', error);
        alert('Request not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleBoostPrice = async (newPrice: number) => {
    if (!request) return;
    
    try {
      setBoosting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update request with new price
      const updatedRequest: ServiceRequest = {
        ...request,
        currentPrice: newPrice,
        status: 'price_boosted',
        priceHistory: [
          ...request.priceHistory,
          { price: newPrice, timestamp: new Date().toISOString() }
        ],
        updatedAt: new Date().toISOString(),
      };
      
      setRequest(updatedRequest);
      setShowBoostModal(false);
      
      // In production: const result = await boostRequestPrice(request.id, newPrice);
      // setRequest(result);
      
      alert('Price boosted successfully! Your request is now more attractive to service providers.');
    } catch (error) {
      console.error('Failed to boost price:', error);
      alert('Failed to boost price. Please try again.');
    } finally {
      setBoosting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production: await cancelRequest(request.id);
      
      alert('Request cancelled successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Request not found</p>
          <Link to="/dashboard" className="text-primary-600 hover:underline mt-2 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canBoostPrice = request.type === 'instant' && 
    ['pending', 'price_boosted'].includes(request.status);
  
  const canCancel = ['pending', 'price_boosted'].includes(request.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {request.categoryName} Request
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Request ID: {request.id}
              </p>
            </div>
            {canBoostPrice && (
              <button
                onClick={() => setShowBoostModal(true)}
                className="px-6 py-2 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors"
              >
                Boost Price
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Request Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-900 dark:text-white mt-1">{request.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Type</label>
                    <p className="text-gray-900 dark:text-white mt-1 capitalize">
                      {request.type === 'instant' ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Instant Service
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Scheduled Service
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Created</label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Current Price</label>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                      ${request.currentPrice.toFixed(2)}
                    </p>
                    {request.currentPrice > request.initialPrice && (
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        (Originally ${request.initialPrice.toFixed(2)})
                      </p>
                    )}
                  </div>

                  {request.type === 'instant' && request.broadcastRadius && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Broadcast Radius</label>
                      <p className="text-gray-900 dark:text-white mt-1">{request.broadcastRadius} km</p>
                    </div>
                  )}

                  {request.type === 'scheduled' && request.scheduledDate && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Scheduled For</label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {new Date(request.scheduledDate).toLocaleDateString()}
                      </p>
                      {request.scheduledTimeSlot && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {request.scheduledTimeSlot}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Location</label>
                  <p className="text-gray-900 dark:text-white mt-1">{request.buyerLocation.address}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Coordinates: {request.buyerLocation.lat.toFixed(4)}, {request.buyerLocation.lng.toFixed(4)}
                  </p>
                </div>

                {request.acceptedBy && (
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-300">
                          Request Accepted
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          Provider ID: {request.acceptedBy}
                          {request.acceptedAt && (
                            <span className="ml-2">
                              • Accepted {new Date(request.acceptedAt).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Messages/Chat Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Messages
              </h2>
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Messaging feature coming soon</p>
                <p className="text-xs mt-1">You'll be able to chat with service providers here</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RequestStatusTimeline request={request} />
            </motion.div>

            {/* Actions */}
            {canCancel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actions
                </h3>
                <button
                  onClick={handleCancelRequest}
                  className="w-full px-4 py-3 rounded-lg border-2 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Cancel Request
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Boost Price Modal */}
      {request && (
        <PriceBoostModal
          isOpen={showBoostModal}
          onClose={() => setShowBoostModal(false)}
          currentPrice={request.currentPrice}
          onConfirm={handleBoostPrice}
          loading={boosting}
        />
      )}
    </div>
  );
};

