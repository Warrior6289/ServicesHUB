import React from 'react';
import { motion } from 'framer-motion';
import { RatingBlock } from './RatingBlock';

export type Listing = {
  id: string;
  title: string;
  price: number;
  status: 'available' | 'sold';
  views: number;
  rating: number;
  description?: string;
};

type ListingCardProps = {
  listing: Listing;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onToggleStatus, onEdit, onRemove }) => {
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
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{listing.description}</p>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">Views: {listing.views}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${listing.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{listing.status}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">${listing.price.toFixed(2)}</p>
          <div className="mt-1"><RatingBlock rating={listing.rating} /></div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onToggleStatus(listing.id)}>
          Mark {listing.status === 'available' ? 'as Sold' : 'as Available'}
        </button>
        <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => onEdit(listing.id)}>Edit</button>
        <button className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700" onClick={() => onRemove(listing.id)}>Remove</button>
      </div>
    </motion.div>
  );
};


