export type SellerProfile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  rating: number;
  reviewsCount: number;
  serviceDescription: string;
  portfolioImages?: string[];
  pricing?: string;
  availability?: string;
  verified: boolean;
  category: string;
  location?: string;
  responseTime?: string;
  completedJobs?: number;
  yearsOfExperience?: number;
  certifications?: string[];
  serviceCategories: string[];
  profilePicture?: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  icon?: string;
};
