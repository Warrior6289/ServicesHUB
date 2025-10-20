import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import type { SellerProfile } from '../types/seller';

interface SellerDetailViewProps {
  seller: SellerProfile;
  onBack: () => void;
  onContact: () => void;
}

export const SellerDetailView: React.FC<SellerDetailViewProps> = ({ seller, onBack, onContact }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </button>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Seller Details</h2>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Seller Info */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-2xl">
              {seller.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{seller.name}</h3>
              {seller.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Verified Professional
                </span>
              )}
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="font-medium">{seller.rating}</span>
                <span className="ml-1">({seller.reviewsCount} reviews)</span>
              </div>
              <div>{seller.location}</div>
              <div>{seller.completedJobs} jobs completed</div>
            </div>
          </div>
        </div>

        {/* Portfolio Images */}
        {seller.portfolioImages && seller.portfolioImages.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Portfolio</h4>
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              pagination={{ clickable: true }}
              className="rounded-lg overflow-hidden"
            >
              {seller.portfolioImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`${seller.name} portfolio ${index + 1}`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Service Description */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">About This Service</h4>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {seller.serviceDescription}
          </p>
        </div>

        {/* Pricing & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Pricing</h5>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{seller.pricing}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Availability</h5>
            <p className="text-green-600 dark:text-green-400 font-medium">{seller.availability}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Response time: {seller.responseTime}
            </p>
          </div>
        </div>

        {/* Reviews Preview */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Recent Reviews</h4>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full mr-3"></div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">Customer {i}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-sm font-medium">{seller.rating}</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Excellent service! Professional and completed the job quickly. Highly recommended.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onContact}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Contact {seller.name}
        </button>
      </div>
    </motion.div>
  );
};
