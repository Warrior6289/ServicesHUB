import React from 'react';
import { motion } from 'framer-motion';

type RatingBlockProps = {
  rating: number; // 0 - 5
};

export const RatingBlock: React.FC<RatingBlockProps> = ({ rating }) => {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <motion.div
      className="flex items-center gap-1 text-amber-500"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, delay: i * 0.06 }}
        >
          {i < full ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 3.16L9.63 9.67l-5.54.81 4 3.9-.94 5.51L12 17.27l4.85 2.55-.94-5.51 4-3.9-5.54-.81L12 5.16z" />
            </svg>
          )}
        </motion.span>
      ))}
      <motion.span
        className="ml-1 text-sm text-slate-500 dark:text-slate-400"
        initial={{ y: 4, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.25 }}
      >
        {rating.toFixed(1)}
      </motion.span>
    </motion.div>
  );
};


