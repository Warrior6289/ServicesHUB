import React from 'react';
import { useForm } from 'react-hook-form';

export type ListingFormValues = {
  title: string;
  price: number;
  description?: string;
};

type ListingFormProps = {
  initial?: ListingFormValues;
  onSubmit?: (values: ListingFormValues) => void;
};

export const ListingForm: React.FC<ListingFormProps> = ({ initial, onSubmit }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ListingFormValues>({
    defaultValues: initial ?? { title: '', price: 0, description: '' },
  });

  const submit = async (values: ListingFormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input {...register('title')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <div>
        <label className="block text-sm font-medium">Price</label>
        <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea rows={3} {...register('description')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-70">Save Listing</button>
    </form>
  );
};


