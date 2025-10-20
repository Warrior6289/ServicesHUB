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
          {i < full ? '★' : '☆'}
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


