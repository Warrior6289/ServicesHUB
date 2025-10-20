import React from 'react';
import { motion } from 'framer-motion';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period = '/month',
  description,
  features,
  popular = false,
  ctaText = 'Get Started',
  onCtaClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl border-2 p-8 ${
        popular
          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 shadow-xl scale-105'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        <div className="mt-6">
          <span className="text-5xl font-bold text-slate-900 dark:text-white">{price}</span>
          {price !== 'Free' && price !== 'Custom' && (
            <span className="text-slate-600 dark:text-slate-400">{period}</span>
          )}
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start"
          >
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
          </motion.li>
        ))}
      </ul>

      <button
        onClick={onCtaClick}
        className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          popular
            ? 'bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
        }`}
      >
        {ctaText}
      </button>
    </motion.div>
  );
};

