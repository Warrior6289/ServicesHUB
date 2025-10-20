import React from 'react';
import { motion } from 'framer-motion';
import { RatingBlock } from './RatingBlock';

export type PurchasedService = {
  id: string;
  name: string;
  price: number;
  provider: string;
  date: string; // ISO
  rating?: number;
  review?: string;
};

type ServiceItemCardProps = {
  service: PurchasedService;
  onSubmitReview?: (id: string, rating: number, review: string) => void;
};

export const ServiceItemCard: React.FC<ServiceItemCardProps> = ({ service, onSubmitReview }) => {
  const [rating, setRating] = React.useState<number>(service.rating ?? 5);
  const [review, setReview] = React.useState<string>(service.review ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview?.(service.id, rating, review);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="group rounded-xl border border-slate-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Provider: {service.provider}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Purchased: {new Date(service.date).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">${service.price.toFixed(2)}</p>
          <div className="mt-1">{service.rating ? <RatingBlock rating={service.rating} /> : null}</div>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 sm:grid-cols-[auto,1fr,auto] items-center gap-3">
        <div className="flex items-center gap-2 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className={`text-xl ${i < rating ? '' : 'text-amber-300'}`}
            >
              ★
            </button>
          ))}
        </div>
        <input
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write a review..."
          className="rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">Submit</button>
      </form>
    </motion.div>
  );
};


