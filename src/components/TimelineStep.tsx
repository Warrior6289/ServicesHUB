import React from 'react';
import { motion } from 'framer-motion';

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  isLast?: boolean;
}

export const TimelineStep: React.FC<TimelineStepProps> = ({
  number,
  title,
  description,
  icon,
  isLast = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 md:left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500" />
      )}

      {/* Number Circle */}
      <div className="relative flex-shrink-0">
        <motion.div
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg"
        >
          <span className="text-xl md:text-2xl font-bold text-white">{number}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          {icon && (
            <div className="mb-4 text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          )}
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

