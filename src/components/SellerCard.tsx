import React from 'react';
import { motion } from 'framer-motion';
import type { SellerProfile } from '../types/seller';

interface SellerCardProps {
  seller: SellerProfile;
  onViewDetails: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onViewDetails }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onViewDetails}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-lg">
              {seller.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {seller.name}
            </h3>
            {seller.verified && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Verified
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="ml-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                {seller.rating}
              </span>
              <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">
                ({seller.reviewsCount} reviews)
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {seller.location}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {seller.serviceDescription}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {seller.pricing}
            </div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              {seller.availability}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
