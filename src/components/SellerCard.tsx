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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
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
