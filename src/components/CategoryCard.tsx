import React from 'react';
import { motion } from 'framer-motion';
import { RatingBlock } from './RatingBlock';

type CategoryCardProps = {
  title: string;
  description?: string;
  rating?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, rating = 4.5, icon, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group rounded-xl border border-slate-200 p-5 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-300/60 dark:hover:border-primary-700/60 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        {icon}
      </div>
      {description ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      ) : null}
      <div className="mt-3">
        <RatingBlock rating={rating} />
      </div>
      <div className="mt-4">
        <button className="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700 transition-colors">
          Browse Professionals
        </button>
      </div>
    </motion.div>
  );
};


