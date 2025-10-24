import type { SellerProfile } from '../types/seller';

export const getDefaultSellerProfile = (): SellerProfile => ({
  id: 'seller-1',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Professional plumber with over 10 years of experience. Specializing in residential and commercial plumbing repairs, installations, and maintenance. Licensed and insured.',
  rating: 4.8,
  reviewsCount: 127,
  serviceDescription: 'Expert plumbing services',
  verified: true,
  category: 'Plumber',
  location: 'New York, NY',
  responseTime: 'Within 2 hours',
  completedJobs: 342,
  yearsOfExperience: 10,
  certifications: ['Licensed Plumber', 'EPA Certified', 'OSHA Safety Certified'],
  serviceCategories: ['Plumber', 'HVAC'],
  profilePicture: undefined,
});

export const getSellerProfile = (): SellerProfile | null => {
  try {
    const stored = localStorage.getItem('sellerProfile');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    // Handle profile loading error
    return null;
  }
};

export const saveSellerProfile = (profile: SellerProfile): void => {
  try {
    localStorage.setItem('sellerProfile', JSON.stringify(profile));
  } catch (error) {
    // Handle profile saving error
  }
};

export const initializeSellerProfile = (): SellerProfile => {
  const existing = getSellerProfile();
  if (existing) {
    return existing;
  }
  
  const defaultProfile = getDefaultSellerProfile();
  saveSellerProfile(defaultProfile);
  return defaultProfile;
};

export const updateSellerProfile = (updates: Partial<SellerProfile>): SellerProfile => {
  const current = getSellerProfile() || getDefaultSellerProfile();
  const updated = { ...current, ...updates };
  saveSellerProfile(updated);
  return updated;
};

export const SERVICE_CATEGORIES = [
  // Construction & Building
  'Plumber',
  'Electrician', 
  'Welder',
  'Carpenter',
  'Painter',
  'HVAC',
  'Roofing',
  'Flooring',
  'Masonry',
  'Drywall',
  'Insulation',
  'Concrete Work',
  'Fencing',
  'Landscaping',
  
  // Home Services
  'Cleaning',
  'Housekeeping',
  'Laundry',
  'Pest Control',
  'Window Cleaning',
  'Carpet Cleaning',
  'Pressure Washing',
  'Gutter Cleaning',
  'Snow Removal',
  
  // Technical Services
  'Technician',
  'Computer Repair',
  'Phone Repair',
  'Appliance Repair',
  'Electronics Repair',
  'Network Setup',
  'Security Systems',
  'Smart Home Installation',
  
  // Automotive
  'Auto Mechanic',
  'Auto Body Repair',
  'Tire Service',
  'Oil Change',
  'Car Wash',
  'Auto Detailing',
  'Towing',
  
  // Personal Services
  'Hair Stylist',
  'Barber',
  'Makeup Artist',
  'Nail Technician',
  'Massage Therapist',
  'Personal Trainer',
  'Photographer',
  'Videographer',
  'Event Planner',
  
  // Professional Services
  'Accountant',
  'Lawyer',
  'Consultant',
  'Translator',
  'Tutor',
  'Music Teacher',
  'Language Teacher',
  'Life Coach',
  
  // Health & Wellness
  'Yoga Instructor',
  'Pilates Instructor',
  'Nutritionist',
  'Physical Therapist',
  'Chiropractor',
  'Dentist',
  'Veterinarian',
  
  // Creative Services
  'Graphic Designer',
  'Web Designer',
  'Artist',
  'Writer',
  'Editor',
  'Musician',
  'DJ',
  'Singer',
  
  // Maintenance & Repair
  'Handyman',
  'Locksmith',
  'Appliance Installation',
  'Furniture Assembly',
  'Moving Services',
  'Storage Solutions',
  
  // Specialized Services
  'Pool Maintenance',
  'Spa Services',
  'Pet Grooming',
  'Pet Sitting',
  'Childcare',
  'Elderly Care',
  'House Sitting',
  'Plant Care',
  
  // Business Services
  'Virtual Assistant',
  'Data Entry',
  'Bookkeeping',
  'Social Media Management',
  'Content Creation',
  'Marketing',
  'Sales',
  'Customer Service'
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
