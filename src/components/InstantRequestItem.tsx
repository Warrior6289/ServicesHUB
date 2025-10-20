import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ServiceRequest } from '../types/serviceRequest';

type InstantRequestItemProps = {
  request: ServiceRequest;
  sellerLocation?: { lat: number; lng: number }; // Seller's location for distance calculation
  onAccept: (requestId: string) => void;
  accepting?: boolean;
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const InstantRequestItem: React.FC<InstantRequestItemProps> = ({
  request,
  sellerLocation,
  onAccept,
  accepting = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [timerColor, setTimerColor] = useState<string>('text-green-600');

  const distance = sellerLocation
    ? calculateDistance(
        sellerLocation.lat,
        sellerLocation.lng,
        request.buyerLocation.lat,
        request.buyerLocation.lng
      )
    : null;

  useEffect(() => {
    if (request.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(request.expiresAt!).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeRemaining('Expired');
          setTimerColor('text-red-600');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);

          // Change color based on time remaining
          if (minutes < 5) {
            setTimerColor('text-red-600');
          } else if (minutes < 15) {
            setTimerColor('text-yellow-600');
          } else {
            setTimerColor('text-green-600');
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [request.expiresAt]);

  const priceWasBoosted = request.currentPrice > request.initialPrice;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-white to-primary-50/30 dark:from-slate-800 dark:to-primary-900/10 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header with Timer */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {request.categoryName}
            </h3>
            {priceWasBoosted && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white animate-pulse">
                BOOSTED!
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {request.buyerName}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${timerColor}`}>
            {timeRemaining}
          </div>
          <div className="text-xs text-gray-500">remaining</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {request.description}
      </p>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-700">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            ${request.currentPrice.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {priceWasBoosted && (
              <span className="line-through">${request.initialPrice.toFixed(0)}</span>
            )}
            {priceWasBoosted ? ' Boosted' : 'Offered'}
          </div>
        </div>

        {distance !== null && (
          <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {distance.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">km away</div>
          </div>
        )}

        <div className="text-center p-2 rounded-lg bg-white dark:bg-slate-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {request.broadcastRadius}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">km radius</div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-4 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location:</div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {request.buyerLocation.address}
        </div>
      </div>

      {/* Accept Button */}
      <button
        onClick={() => onAccept(request.id)}
        disabled={accepting || timeRemaining === 'Expired'}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {accepting ? 'Accepting...' : timeRemaining === 'Expired' ? 'Request Expired' : 'Accept Request'}
      </button>
    </motion.div>
  );
};

