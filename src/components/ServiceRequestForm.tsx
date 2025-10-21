import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LocationInput } from './LocationInput';
import type { Location } from '../types/serviceRequest';
import { SERVICE_CATEGORIES } from '../mocks/sellerProfile';
import { useClickOutside } from '../hooks/useClickOutside';

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

const categories = SERVICE_CATEGORIES.map(category => ({
  id: category.toLowerCase().replace(/\s+/g, '-'),
  name: category
}));

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
  const [categorySearch, setCategorySearch] = useState('');
  
  const categoryDropdownRef = useClickOutside<HTMLDivElement>(() => {
    setShowCategoryDropdown(false);
  });
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

  // const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const categoryId = e.target.value;
  //   const category = categories.find(c => c.id === categoryId);
  //   setValue('categoryId', categoryId);
  //   if (category) {
  //     setValue('categoryName', category.name);
  //   }
  // };

  const handleTypeChange = (type: 'instant' | 'scheduled') => {
    setRequestType(type);
    setValue('type', type);
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
    setValue('location', newLocation);
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!categorySearch.trim()) {
      return categories;
    }
    
    const searchTerm = categorySearch.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm)
    );
  }, [categorySearch]);

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
        
        {/* Searchable dropdown */}
        <div className="relative" ref={categoryDropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Type to search categories..."
              value={categorySearch || watch('categoryName') || ''}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setShowCategoryDropdown(true);
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                <div className="py-2">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setValue('categoryId', category.id);
                        setValue('categoryName', category.name);
                        setShowCategoryDropdown(false);
                        setCategorySearch('');
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No categories found</p>
                  <button
                    onClick={() => setCategorySearch('')}
                    className="mt-2 text-primary-600 dark:text-primary-400 hover:underline text-sm"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
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

