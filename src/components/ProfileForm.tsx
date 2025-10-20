import React from 'react';
import { useForm } from 'react-hook-form';

type ProfileValues = {
  name: string;
  email: string;
  phone?: string;
};

type ProfileFormProps = {
  initial?: ProfileValues;
  onSubmit?: (values: ProfileValues) => void;
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ initial, onSubmit }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileValues>({
    defaultValues: initial ?? { name: '', email: '', phone: '' },
    mode: 'onBlur',
  });

  const submit = async (values: ProfileValues) => {
    await new Promise((r) => setTimeout(r, 500));
    
    // Update localStorage with new profile data
    const existingUserData = localStorage.getItem('userData');
    if (existingUserData) {
      const parsed = JSON.parse(existingUserData);
      const updatedData = { ...parsed, ...values };
      localStorage.setItem('userData', JSON.stringify(updatedData));
    }
    
    onSubmit?.(values);
    alert('Profile updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input {...register('name')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" {...register('email')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input {...register('phone')} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-70">Save</button>
    </form>
  );
};


