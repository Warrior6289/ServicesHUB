import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PriceBoostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  onConfirm: (newPrice: number) => void;
  loading?: boolean;
};

export const PriceBoostModal: React.FC<PriceBoostModalProps> = ({
  isOpen,
  onClose,
  currentPrice,
  onConfirm,
  loading = false,
}) => {
  const [newPrice, setNewPrice] = useState<string>(currentPrice.toFixed(2));
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    const priceValue = parseFloat(newPrice);
    
    if (isNaN(priceValue)) {
      setError('Please enter a valid price');
      return;
    }
    
    if (priceValue <= currentPrice) {
      setError('New price must be higher than current price');
      return;
    }

    if (priceValue > currentPrice * 3) {
      setError('Price increase is too high (max 3x current price)');
      return;
    }

    setError('');
    onConfirm(priceValue);
  };

  const increasePercentage = ((parseFloat(newPrice) - currentPrice) / currentPrice) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Boost Your Price
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info Box */}
              <div className="mb-6 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Boosting your price can attract more service providers!
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                      Your request hasn't been accepted yet. Increasing the price may help.
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Price
                </label>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${currentPrice.toFixed(2)}
                </div>
              </div>

              {/* New Price Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min={currentPrice + 1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 text-lg rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Enter new price"
                  />
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              {/* Increase Percentage */}
              {!isNaN(increasePercentage) && increasePercentage > 0 && (
                <div className="mb-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Price increase:
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    +{increasePercentage.toFixed(1)}%
                    <span className="text-sm font-normal ml-2">
                      (${(parseFloat(newPrice) - currentPrice).toFixed(2)} more)
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Increase Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Increase
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => setNewPrice((currentPrice * (1 + percent / 100)).toFixed(2))}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      +{percent}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-lg bg-orange-600 font-medium text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Boosting...' : 'Boost Price'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

