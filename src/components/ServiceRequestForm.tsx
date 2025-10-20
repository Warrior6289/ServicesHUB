import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LocationInput } from './LocationInput';
import type { Location } from '../types/serviceRequest';

const serviceRequestSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  categoryName: z.string().min(1, 'Category name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(10, 'Price must be at least $10'),
  type: z.enum(['instant', 'scheduled']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().min(1, 'Address is required'),
  }),
  broadcastRadius: z.number().min(5).max(50).optional(),
  scheduledDate: z.string().optional(),
  scheduledTimeSlot: z.string().optional(),
  preferredSellerId: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

type ServiceRequestFormProps = {
  initialCategory?: { id: string; name: string };
  onSubmit: (data: ServiceRequestFormData) => void;
  loading?: boolean;
};

const categories = [
  { id: 'plumber', name: 'Plumber' },
  { id: 'electrician', name: 'Electrician' },
  { id: 'welder', name: 'Welder' },
  { id: 'carpenter', name: 'Carpenter' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'painter', name: 'Painter' },
  { id: 'cleaner', name: 'Cleaning' },
  { id: 'technician', name: 'Technician' },
];

const timeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
];

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  initialCategory,
  onSubmit,
  loading = false,
}) => {
  const [requestType, setRequestType] = useState<'instant' | 'scheduled'>('instant');
  const [location, setLocation] = useState<Location | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      categoryId: initialCategory?.id || '',
      categoryName: initialCategory?.name || '',
      type: 'instant',
      broadcastRadius: 10,
      price: 50,
    },
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const category = categories.find(c => c.id === categoryId);
    setValue('categoryId', categoryId);
    if (category) {
      setValue('categoryName', category.name);
    }
  };

  const handleTypeChange = (type: 'instant' | 'scheduled') => {
    setRequestType(type);
    setValue('type', type);
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
    setValue('location', newLocation);
  };

  const onFormSubmit = (data: ServiceRequestFormData) => {
    if (!location) {
      alert('Please select a location');
      return;
    }
    onSubmit({ ...data, location });
  };

  // Get minimum date for scheduling (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Request Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Request Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('instant')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              requestType === 'instant'
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Instant Service</div>
            <div className="text-xs mt-1 opacity-75">Get help ASAP</div>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('scheduled')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              requestType === 'scheduled'
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Schedule Service</div>
            <div className="text-xs mt-1 opacity-75">Book for later</div>
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Service Category *
        </label>
        <select
          {...register('categoryId')}
          onChange={handleCategoryChange}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe what you need help with..."
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Offered Price ($) *
        </label>
        <input
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      {/* Location */}
      <LocationInput
        value={location}
        onChange={handleLocationChange}
        error={errors.location?.message}
      />

      {/* Conditional Fields - Instant */}
      {requestType === 'instant' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Broadcast Radius: {watch('broadcastRadius') || 10} km
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            {...register('broadcastRadius', { valueAsNumber: true })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km (Nearby)</span>
            <span>50 km (Wide Area)</span>
          </div>
        </div>
      )}

      {/* Conditional Fields - Scheduled */}
      {requestType === 'scheduled' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preferred Date *
            </label>
            <input
              type="date"
              min={minDateString}
              {...register('scheduledDate')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
            />
            {errors.scheduledDate && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Slot *
            </label>
            <select
              {...register('scheduledTimeSlot')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {errors.scheduledTimeSlot && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduledTimeSlot.message}</p>
            )}
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : requestType === 'instant' ? 'Request Instant Service' : 'Schedule Service'}
      </button>
    </form>
  );
};

