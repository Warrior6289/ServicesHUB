import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ServiceRequest } from '../types/serviceRequest';
import { Link } from 'react-router-dom';

type ServiceRequestCardProps = {
  request: ServiceRequest;
  onBoostPrice?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  viewType?: 'buyer' | 'seller';
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  price_boosted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  converted_to_scheduled: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const statusLabels = {
  pending: 'Pending',
  price_boosted: 'Price Boosted',
  converted_to_scheduled: 'Converted to Scheduled',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  onBoostPrice,
  onCancel,
  viewType = 'buyer',
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (request.type === 'instant' && request.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(request.expiresAt!).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeRemaining('Expired');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [request.type, request.expiresAt]);

  const canBoostPrice = viewType === 'buyer' && 
    request.type === 'instant' && 
    ['pending', 'price_boosted'].includes(request.status);

  const canCancel = viewType === 'buyer' && 
    ['pending', 'price_boosted'].includes(request.status);

  const priceWasBoosted = request.currentPrice > request.initialPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {request.categoryName}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
              {statusLabels[request.status]}
            </span>
            {request.type === 'instant' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Instant
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {request.description.length > 100
              ? `${request.description.slice(0, 100)}...`
              : request.description}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Price:</span>
          <div className="font-semibold text-gray-900 dark:text-white">
            ${request.currentPrice.toFixed(2)}
            {priceWasBoosted && (
              <span className="ml-1 text-xs text-orange-600 dark:text-orange-400">
                (Boosted from ${request.initialPrice.toFixed(2)})
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-gray-500 dark:text-gray-400">Location:</span>
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {request.buyerLocation.address.split(',')[0]}
          </div>
        </div>

        {request.type === 'instant' && request.expiresAt && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Expires in:</span>
            <div className={`font-semibold ${
              timeRemaining === 'Expired' ? 'text-red-600' : 'text-gray-900 dark:text-white'
            }`}>
              {timeRemaining}
            </div>
          </div>
        )}

        {request.type === 'scheduled' && request.scheduledDate && (
          <>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Scheduled:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {new Date(request.scheduledDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Time:</span>
              <div className="font-medium text-gray-900 dark:text-white">
                {request.scheduledTimeSlot}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={`/requests/${request.id}`}
          className="flex-1 text-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          View Details
        </Link>

        {canBoostPrice && onBoostPrice && (
          <button
            onClick={() => onBoostPrice(request.id)}
            className="flex-1 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Boost Price
          </button>
        )}

        {canCancel && onCancel && (
          <button
            onClick={() => onCancel(request.id)}
            className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
};

