import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import type { SellerProfile } from '../types/seller';
import { SERVICE_CATEGORIES, updateSellerProfile } from '../mocks/sellerProfile';

type SellerProfileFormValues = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  yearsOfExperience: number;
  serviceCategories: string[];
  certifications: string[];
};

type SellerProfileFormProps = {
  initial?: SellerProfile;
  onSubmit?: (values: SellerProfileFormValues) => void;
};

export const SellerProfileForm: React.FC<SellerProfileFormProps> = ({ 
  initial, 
  onSubmit 
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [certificationInput, setCertificationInput] = React.useState('');
  const [profileImage, setProfileImage] = React.useState<string | null>(initial?.profilePicture || null);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [categorySearch, setCategorySearch] = React.useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<SellerProfileFormValues>({
    defaultValues: {
      name: initial?.name || '',
      email: initial?.email || '',
      phone: initial?.phone || '',
      bio: initial?.bio || '',
      location: initial?.location || '',
      yearsOfExperience: initial?.yearsOfExperience || 0,
      serviceCategories: initial?.serviceCategories || [],
      certifications: initial?.certifications || [],
    },
    mode: 'onBlur',
  });

  const watchedServiceCategories = watch('serviceCategories');
  const watchedCertifications = watch('certifications');

  const toggleServiceCategory = (category: string) => {
    const current = watchedServiceCategories || [];
    if (current.includes(category)) {
      setValue('serviceCategories', current.filter(c => c !== category));
    } else {
      setValue('serviceCategories', [...current, category]);
    }
  };

  const addCertification = () => {
    if (certificationInput.trim() && !watchedCertifications.includes(certificationInput.trim())) {
      setValue('certifications', [...watchedCertifications, certificationInput.trim()]);
      setCertificationInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setValue('certifications', watchedCertifications.filter(c => c !== cert));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // Convert file to base64 for demo purposes
      // In production, you would upload to a cloud service like AWS S3, Cloudinary, etc.
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        
        // Update the profile with the new image
        const updatedProfile = {
          ...initial,
          profilePicture: result,
        };
        
        // Save to localStorage
        localStorage.setItem('sellerProfile', JSON.stringify(updatedProfile));
        
        setIsUploadingImage(false);
        alert('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      // Handle image upload error
      alert('Failed to upload image. Please try again.');
      setIsUploadingImage(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    const updatedProfile = {
      ...initial,
      profilePicture: undefined,
    };
    localStorage.setItem('sellerProfile', JSON.stringify(updatedProfile));
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!categorySearch.trim()) {
      return SERVICE_CATEGORIES;
    }
    
    const searchTerm = categorySearch.toLowerCase();
    return SERVICE_CATEGORIES.filter(category => 
      category.toLowerCase().includes(searchTerm)
    );
  }, [categorySearch]);

  // Group categories by type for better organization
  const groupedCategories = React.useMemo(() => {
    const groups: { [key: string]: string[] } = {
      'Construction & Building': [],
      'Home Services': [],
      'Technical Services': [],
      'Automotive': [],
      'Personal Services': [],
      'Professional Services': [],
      'Health & Wellness': [],
      'Creative Services': [],
      'Maintenance & Repair': [],
      'Specialized Services': [],
      'Business Services': []
    };

    filteredCategories.forEach(category => {
      // Categorize based on the category name
      if (['Plumber', 'Electrician', 'Welder', 'Carpenter', 'Painter', 'HVAC', 'Roofing', 'Flooring', 'Masonry', 'Drywall', 'Insulation', 'Concrete Work', 'Fencing', 'Landscaping'].includes(category)) {
        groups['Construction & Building'].push(category);
      } else if (['Cleaning', 'Housekeeping', 'Laundry', 'Pest Control', 'Window Cleaning', 'Carpet Cleaning', 'Pressure Washing', 'Gutter Cleaning', 'Snow Removal'].includes(category)) {
        groups['Home Services'].push(category);
      } else if (['Technician', 'Computer Repair', 'Phone Repair', 'Appliance Repair', 'Electronics Repair', 'Network Setup', 'Security Systems', 'Smart Home Installation'].includes(category)) {
        groups['Technical Services'].push(category);
      } else if (['Auto Mechanic', 'Auto Body Repair', 'Tire Service', 'Oil Change', 'Car Wash', 'Auto Detailing', 'Towing'].includes(category)) {
        groups['Automotive'].push(category);
      } else if (['Hair Stylist', 'Barber', 'Makeup Artist', 'Nail Technician', 'Massage Therapist', 'Personal Trainer', 'Photographer', 'Videographer', 'Event Planner'].includes(category)) {
        groups['Personal Services'].push(category);
      } else if (['Accountant', 'Lawyer', 'Consultant', 'Translator', 'Tutor', 'Music Teacher', 'Language Teacher', 'Life Coach'].includes(category)) {
        groups['Professional Services'].push(category);
      } else if (['Yoga Instructor', 'Pilates Instructor', 'Nutritionist', 'Physical Therapist', 'Chiropractor', 'Dentist', 'Veterinarian'].includes(category)) {
        groups['Health & Wellness'].push(category);
      } else if (['Graphic Designer', 'Web Designer', 'Artist', 'Writer', 'Editor', 'Musician', 'DJ', 'Singer'].includes(category)) {
        groups['Creative Services'].push(category);
      } else if (['Handyman', 'Locksmith', 'Appliance Installation', 'Furniture Assembly', 'Moving Services', 'Storage Solutions'].includes(category)) {
        groups['Maintenance & Repair'].push(category);
      } else if (['Pool Maintenance', 'Spa Services', 'Pet Grooming', 'Pet Sitting', 'Childcare', 'Elderly Care', 'House Sitting', 'Plant Care'].includes(category)) {
        groups['Specialized Services'].push(category);
      } else if (['Virtual Assistant', 'Data Entry', 'Bookkeeping', 'Social Media Management', 'Content Creation', 'Marketing', 'Sales', 'Customer Service'].includes(category)) {
        groups['Business Services'].push(category);
      }
    });

    // Remove empty groups
    return Object.entries(groups).filter(([_, categories]) => categories.length > 0);
  }, [filteredCategories]);

  const handleFormSubmit = async (values: SellerProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Update localStorage
      updateSellerProfile(values);
      
      setIsEditing(false);
      onSubmit?.(values);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      // Handle profile update error
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Seller Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={`${initial?.name || 'User'} profile picture`}
                className="w-full h-full object-cover rounded-full"
                role="img"
                aria-label="Profile picture"
              />
            ) : (
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {isEditing && (
            <div className="flex flex-col gap-2">
              <label className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                  aria-label="Upload profile picture"
                />
                {isUploadingImage ? 'Uploading...' : 'Upload Photo'}
              </label>
              {profileImage && (
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            {isEditing ? (
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Your full name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{initial?.name || 'Not provided'}</p>
            )}
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            {isEditing ? (
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="your@email.com"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{initial?.email || 'Not provided'}</p>
            )}
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            {isEditing ? (
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{initial?.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Years of Experience
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="50"
                {...register('yearsOfExperience', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="5"
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{initial?.yearsOfExperience || 0} years</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          {isEditing ? (
            <input
              {...register('location')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="City, State"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{initial?.location || 'Not provided'}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio / Service Description
          </label>
          {isEditing ? (
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Tell customers about your services, experience, and what makes you unique..."
            />
          ) : (
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {initial?.bio || 'No bio provided'}
            </p>
          )}
        </div>

        {/* Service Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Service Categories *
          </label>
          {isEditing ? (
            <div className="space-y-4">
              {/* Search for categories */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                {categorySearch ? (
                  <button
                    onClick={() => setCategorySearch('')}
                    className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              
              {/* Quick Filter Buttons */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">Quick filters:</div>
                <div className="flex flex-wrap gap-2">
                  {['Construction', 'Home', 'Technical', 'Automotive', 'Personal', 'Professional', 'Health', 'Creative'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCategorySearch(filter)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                  <button
                    onClick={() => setCategorySearch('')}
                    className="px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {/* Categories organized by sections */}
              <div className="max-h-80 overflow-y-auto space-y-4">
                {groupedCategories.map(([groupName, categories]) => (
                  <div key={groupName} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-1">
                      {groupName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={watchedServiceCategories?.includes(category) || false}
                            onChange={() => toggleServiceCategory(category)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                {filteredCategories.length === 0 && categorySearch && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No categories found matching "{categorySearch}"</p>
                    <button
                      onClick={() => setCategorySearch('')}
                      className="mt-2 text-primary-600 dark:text-primary-400 hover:underline text-sm"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
              
              {/* Selected count */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {watchedServiceCategories?.length || 0} categories selected
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {initial?.serviceCategories?.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                >
                  {category}
                </span>
              )) || <p className="text-gray-500 dark:text-gray-400">No categories selected</p>}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Certifications
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={certificationInput}
                  onChange={(e) => setCertificationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add certification..."
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchedCertifications?.map((cert) => (
                  <span
                    key={cert}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {initial?.certifications?.map((cert) => (
                <span
                  key={cert}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                >
                  {cert}
                </span>
              )) || <p className="text-gray-500 dark:text-gray-400">No certifications</p>}
            </div>
          )}
        </div>

        {/* Rating Display (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(initial?.rating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {initial?.rating?.toFixed(1)} ({initial?.reviewsCount || 0} reviews)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </form>
    </div>
  );
};
