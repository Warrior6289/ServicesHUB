import React from 'react';
import { ServiceItemCard, type PurchasedService } from '../components/ServiceItemCard';
import { ProfileForm } from '../components/ProfileForm';
import { CategoryCard } from '../components/CategoryCard';
import { SellerProfileModal } from '../components/SellerProfileModal';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { SearchBar } from '../components/SearchBar';
import { fetchUserPurchased, submitServiceReview, fetchSellersByCategory } from '../api/services';
import type { SellerProfile } from '../types/seller';
import { ServiceRequestCard } from '../components/ServiceRequestCard';
import { PriceBoostModal } from '../components/PriceBoostModal';
// import { getUserRequests, boostRequestPrice, cancelRequest } from '../api/serviceRequests';
import type { ServiceRequest } from '../types/serviceRequest';
import { getMockUserRequests } from '../mocks/serviceRequests';
import { Link } from 'react-router-dom';

export const UserDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'services' | 'requests'>('services');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [services, setServices] = React.useState<PurchasedService[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  
  // Category search and pagination state
  const [categorySearch, setCategorySearch] = React.useState('');
  const [categoriesToShow, setCategoriesToShow] = React.useState(12); // Show 12 categories initially
  const [showAllCategories, setShowAllCategories] = React.useState(false);
  
  // Service Requests state
  const [requests, setRequests] = React.useState<ServiceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = React.useState(false);
  const [requestFilter, setRequestFilter] = React.useState<'all' | 'active' | 'completed' | 'cancelled'>('active');
  const [showBoostModal, setShowBoostModal] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
  const [boosting, setBoosting] = React.useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [sellers, setSellers] = React.useState<SellerProfile[]>([]);
  const [selectedSeller, setSelectedSeller] = React.useState<SellerProfile | null>(null);
  const [loadingSellers, setLoadingSellers] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to load from localStorage first
        const storedServices = localStorage.getItem('userServices');
        if (storedServices) {
          const parsedServices = JSON.parse(storedServices);
          if (mounted && Array.isArray(parsedServices)) {
            setServices(parsedServices);
            setLoading(false);
            return;
          }
        }
        
        // If no localStorage data, try API
        const data = await fetchUserPurchased();
        if (mounted && Array.isArray(data)) {
          setServices(data);
          localStorage.setItem('userServices', JSON.stringify(data));
        } else {
          throw new Error('Invalid data format');
        }
      } catch (e) {
        setError('Failed to load your services. Showing example data.');
        const defaultServices = [
          { id: 's1', name: 'Plumbing Fix', price: 89.99, provider: 'AquaPros', date: new Date().toISOString(), rating: 5, review: 'Great job!' },
          { id: 's2', name: 'AC Maintenance', price: 129.00, provider: 'CoolCare', date: new Date(Date.now() - 86400000).toISOString() },
        ];
        if (mounted) {
          setServices(defaultServices);
          localStorage.setItem('userServices', JSON.stringify(defaultServices));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submitReview = async (id: string, rating: number, review: string) => {
    try {
      await submitServiceReview(id, rating, review);
      const updatedServices = services.map(s => s.id === id ? { ...s, rating, review } : s);
      setServices(updatedServices);
      localStorage.setItem('userServices', JSON.stringify(updatedServices));
    } catch (e) {
      alert('Failed to submit review. Please try again later.');
    }
  };

  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setModalOpen(true);
    setLoadingSellers(true);
    setSelectedSeller(null);
    
    try {
      const data = await fetchSellersByCategory(categoryName.toLowerCase());
      // Ensure we always set an array
      const sellersData = Array.isArray(data) ? data : [];
      setSellers(sellersData);
    } catch (error) {
      // Handle sellers fetch error
      setSellers([]);
    } finally {
      setLoadingSellers(false);
    }
  };

  const handleSellerSelect = (seller: SellerProfile) => {
    setSelectedSeller(seller);
  };

  const handleSellerBack = () => {
    setSelectedSeller(null);
  };

  const handleContact = (seller: SellerProfile) => {
    alert(`Contacting ${seller.name}... This would open a contact form or messaging system.`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSeller(null);
    setSellers([]);
    setSelectedCategory(null);
  };

  // Category pagination functions
  const handleShowMore = () => {
    setShowAllCategories(true);
    setCategoriesToShow(categories.length);
    // Smooth scroll to top of categories section
    setTimeout(() => {
      const categoriesSection = document.querySelector('[data-categories-section]');
      categoriesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleShowLess = () => {
    setShowAllCategories(false);
    setCategoriesToShow(12);
    // Smooth scroll to top of categories section
    setTimeout(() => {
      const categoriesSection = document.querySelector('[data-categories-section]');
      categoriesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLoadMore = () => {
    setCategoriesToShow(prev => Math.min(prev + 12, categories.length));
  };

  // Reset pagination when search changes
  React.useEffect(() => {
    setCategoriesToShow(12);
    setShowAllCategories(false);
  }, [categorySearch]);

  // Fetch service requests
  React.useEffect(() => {
    if (activeTab === 'requests') {
      const fetchRequests = async () => {
        try {
          setRequestsLoading(true);
          // Use mock data for development
          const data = getMockUserRequests();
          setRequests(data);
        } catch (error) {
          // Handle requests fetch error
        } finally {
          setRequestsLoading(false);
        }
      };
      fetchRequests();
    }
  }, [activeTab]);

  const handleBoostPrice = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowBoostModal(true);
    }
  };

  const handleConfirmBoost = async (newPrice: number) => {
    if (!selectedRequest) return;

    try {
      setBoosting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRequest: ServiceRequest = {
        ...selectedRequest,
        currentPrice: newPrice,
        status: 'price_boosted',
        priceHistory: [
          ...selectedRequest.priceHistory,
          { price: newPrice, timestamp: new Date().toISOString() }
        ],
      };

      setRequests(prev => prev.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setShowBoostModal(false);
      setSelectedRequest(null);
      alert('Price boosted successfully!');
    } catch (error) {
      // Handle price boost error
      alert('Failed to boost price. Please try again.');
    } finally {
      setBoosting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRequests(prev => prev.filter(r => r.id !== requestId));
      alert('Request cancelled successfully');
    } catch (error) {
      // Handle request cancellation error
      alert('Failed to cancel request. Please try again.');
    }
  };

  const filteredRequests = requests.filter(request => {
    if (requestFilter === 'active') {
      return ['pending', 'price_boosted', 'accepted', 'in_progress'].includes(request.status);
    } else if (requestFilter === 'completed') {
      return request.status === 'completed';
    } else if (requestFilter === 'cancelled') {
      return ['cancelled', 'expired'].includes(request.status);
    }
    return true;
  });

  // Categories data - expanded list
  const categories = [
    // Construction & Building
    { title: 'Plumber', description: 'Leaks, installations, repairs', rating: 4.7 },
    { title: 'Electrician', description: 'Wiring, lighting, panels', rating: 4.5 },
    { title: 'Welder', description: 'Fabrication, metal repairs', rating: 4.4 },
    { title: 'Carpenter', description: 'Furniture, frames, fittings', rating: 4.2 },
    { title: 'Painter', description: 'Interior, exterior, finishing', rating: 4.3 },
    { title: 'HVAC', description: 'Heating, ventilation, AC', rating: 4.5 },
    { title: 'Roofing', description: 'Roof repairs, installations', rating: 4.4 },
    { title: 'Flooring', description: 'Hardwood, tile, carpet installation', rating: 4.3 },
    { title: 'Masonry', description: 'Brick, stone, concrete work', rating: 4.2 },
    { title: 'Landscaping', description: 'Garden design, maintenance', rating: 4.6 },
    
    // Home Services
    { title: 'Cleaning', description: 'Home, office, deep clean', rating: 4.1 },
    { title: 'Housekeeping', description: 'Regular home maintenance', rating: 4.2 },
    { title: 'Pest Control', description: 'Extermination, prevention', rating: 4.3 },
    { title: 'Window Cleaning', description: 'Residential, commercial', rating: 4.4 },
    { title: 'Carpet Cleaning', description: 'Deep clean, stain removal', rating: 4.2 },
    { title: 'Pressure Washing', description: 'Exterior cleaning', rating: 4.5 },
    
    // Technical Services
    { title: 'Technician', description: 'Appliances, diagnostics', rating: 4.6 },
    { title: 'Computer Repair', description: 'Hardware, software fixes', rating: 4.4 },
    { title: 'Phone Repair', description: 'Screen, battery, water damage', rating: 4.3 },
    { title: 'Appliance Repair', description: 'Washer, dryer, refrigerator', rating: 4.5 },
    { title: 'Network Setup', description: 'WiFi, security systems', rating: 4.2 },
    { title: 'Smart Home Installation', description: 'Home automation setup', rating: 4.1 },
    
    // Automotive
    { title: 'Auto Mechanic', description: 'Engine, transmission repair', rating: 4.4 },
    { title: 'Auto Body Repair', description: 'Collision, dent repair', rating: 4.3 },
    { title: 'Tire Service', description: 'Installation, balancing', rating: 4.5 },
    { title: 'Oil Change', description: 'Quick oil change service', rating: 4.6 },
    { title: 'Car Wash', description: 'Exterior, interior cleaning', rating: 4.2 },
    { title: 'Auto Detailing', description: 'Premium car cleaning', rating: 4.4 },
    
    // Personal Services
    { title: 'Hair Stylist', description: 'Cut, color, styling', rating: 4.5 },
    { title: 'Barber', description: 'Men\'s haircuts, grooming', rating: 4.6 },
    { title: 'Makeup Artist', description: 'Special events, photos', rating: 4.4 },
    { title: 'Massage Therapist', description: 'Relaxation, therapeutic', rating: 4.7 },
    { title: 'Personal Trainer', description: 'Fitness, nutrition coaching', rating: 4.3 },
    { title: 'Photographer', description: 'Events, portraits, commercial', rating: 4.5 },
    { title: 'Videographer', description: 'Weddings, corporate videos', rating: 4.4 },
    { title: 'Event Planner', description: 'Parties, corporate events', rating: 4.2 },
    
    // Professional Services
    { title: 'Accountant', description: 'Tax preparation, bookkeeping', rating: 4.6 },
    { title: 'Lawyer', description: 'Legal consultation, representation', rating: 4.4 },
    { title: 'Consultant', description: 'Business, strategy advice', rating: 4.3 },
    { title: 'Translator', description: 'Document, live translation', rating: 4.5 },
    { title: 'Tutor', description: 'Academic subjects, test prep', rating: 4.4 },
    { title: 'Music Teacher', description: 'Piano, guitar, voice lessons', rating: 4.6 },
    { title: 'Language Teacher', description: 'ESL, foreign languages', rating: 4.3 },
    { title: 'Life Coach', description: 'Personal development, goals', rating: 4.2 },
    
    // Health & Wellness
    { title: 'Yoga Instructor', description: 'Classes, private sessions', rating: 4.7 },
    { title: 'Pilates Instructor', description: 'Group, individual training', rating: 4.5 },
    { title: 'Nutritionist', description: 'Diet planning, health advice', rating: 4.4 },
    { title: 'Physical Therapist', description: 'Rehabilitation, injury recovery', rating: 4.6 },
    { title: 'Chiropractor', description: 'Spinal adjustment, pain relief', rating: 4.3 },
    { title: 'Dentist', description: 'General, cosmetic dentistry', rating: 4.5 },
    { title: 'Veterinarian', description: 'Pet health, emergency care', rating: 4.7 },
    
    // Creative Services
    { title: 'Graphic Designer', description: 'Logos, marketing materials', rating: 4.4 },
    { title: 'Web Designer', description: 'Website design, development', rating: 4.3 },
    { title: 'Artist', description: 'Custom artwork, murals', rating: 4.5 },
    { title: 'Writer', description: 'Content, copywriting', rating: 4.2 },
    { title: 'Editor', description: 'Proofreading, manuscript review', rating: 4.4 },
    { title: 'Musician', description: 'Live performances, recording', rating: 4.6 },
    { title: 'DJ', description: 'Events, parties, weddings', rating: 4.3 },
    
    // Maintenance & Repair
    { title: 'Handyman', description: 'General repairs, maintenance', rating: 4.5 },
    { title: 'Locksmith', description: 'Lock installation, emergency', rating: 4.4 },
    { title: 'Appliance Installation', description: 'Washer, dryer, dishwasher', rating: 4.3 },
    { title: 'Furniture Assembly', description: 'IKEA, custom furniture', rating: 4.2 },
    { title: 'Moving Services', description: 'Local, long-distance moves', rating: 4.1 },
    { title: 'Storage Solutions', description: 'Storage unit organization', rating: 4.0 },
    
    // Specialized Services
    { title: 'Pool Maintenance', description: 'Cleaning, chemical balance', rating: 4.4 },
    { title: 'Spa Services', description: 'Facials, body treatments', rating: 4.6 },
    { title: 'Pet Grooming', description: 'Bathing, trimming, styling', rating: 4.5 },
    { title: 'Pet Sitting', description: 'Overnight, daily care', rating: 4.7 },
    { title: 'Childcare', description: 'Babysitting, nanny services', rating: 4.6 },
    { title: 'Elderly Care', description: 'Companion, assistance', rating: 4.8 },
    { title: 'House Sitting', description: 'Pet care, security', rating: 4.3 },
    { title: 'Plant Care', description: 'Garden maintenance, watering', rating: 4.2 },
    
    // Business Services
    { title: 'Virtual Assistant', description: 'Administrative support', rating: 4.3 },
    { title: 'Data Entry', description: 'Document processing, input', rating: 4.1 },
    { title: 'Bookkeeping', description: 'Financial record keeping', rating: 4.4 },
    { title: 'Social Media Management', description: 'Content, engagement', rating: 4.2 },
    { title: 'Content Creation', description: 'Blogs, articles, videos', rating: 4.3 },
    { title: 'Marketing', description: 'Digital, traditional marketing', rating: 4.1 },
    { title: 'Sales', description: 'Lead generation, closing', rating: 4.0 },
    { title: 'Customer Service', description: 'Support, call handling', rating: 4.2 }
  ];

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) => {
    const searchLower = categorySearch.toLowerCase();
    return (
      cat.title.toLowerCase().includes(searchLower) ||
      cat.description.toLowerCase().includes(searchLower)
    );
  });

  // Get categories to display based on pagination
  const displayedCategories = filteredCategories.slice(0, categoriesToShow);
  const hasMoreCategories = filteredCategories.length > categoriesToShow;

  return (
    <section className="max-w-none">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your Dashboard</h1>
        <Link
          to="/request-service"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Request New Service
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'services'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Purchased Services
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'requests'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Requests
          </button>
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <>
          {/* Categories Section */}
          <div className="mt-8" data-categories-section>
        <h2 className="text-xl font-semibold mb-4">Browse Service Categories</h2>
        
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <SearchBar
            placeholder="Search categories..."
            value={categorySearch}
            onChange={setCategorySearch}
            onClear={() => setCategorySearch('')}
          />
          
          {/* Quick Filter Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick filters:</span>
            {['Construction', 'Home Services', 'Technical', 'Automotive', 'Personal', 'Professional'].map((filter) => (
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
              Clear All
            </button>
          </div>
        </div>

        {/* Category Grid */}
        {filteredCategories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCategories.map((category) => (
                <CategoryCard
                  key={category.title}
                  title={category.title}
                  description={category.description}
                  rating={category.rating}
                  onClick={() => handleCategoryClick(category.title)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredCategories.length > 12 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {displayedCategories.length} of {filteredCategories.length} categories
                </div>
                
                <div className="flex gap-3">
                  {hasMoreCategories && !showAllCategories && (
                    <>
                      <button
                        onClick={handleLoadMore}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                      >
                        Load More ({Math.min(12, filteredCategories.length - categoriesToShow)})
                      </button>
                      <button
                        onClick={handleShowMore}
                        className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
                      >
                        Show All ({filteredCategories.length})
                      </button>
                    </>
                  )}
                  
                  {showAllCategories && (
                    <button
                      onClick={handleShowLess}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">No categories found matching "{categorySearch}"</p>
            <button
              onClick={() => setCategorySearch('')}
              className="mt-4 text-primary-600 dark:text-primary-400 hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <h2 className="text-lg font-medium">Purchased Services</h2>
            {error ? <p className="text-sm text-amber-600">{error}</p> : null}
            {loading ? (
              <div className="mt-4 grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 dark:border-slate-700">
                    <Skeleton className="h-5 w-1/3" />
                    <SkeletonText className="mt-2" lines={2} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4">
                {Array.isArray(services) && services.length > 0 ? services.map(s => (
                  <ServiceItemCard key={s.id} service={s} onSubmitReview={submitReview} />
                )) : (
                  <p className="text-slate-500 dark:text-slate-400">No purchased services yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
        <aside className="lg:col-span-1">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <h2 className="text-lg font-medium">Profile</h2>
            <ProfileForm 
              initial={(() => {
                const userData = localStorage.getItem('userData');
                if (userData) {
                  const parsed = JSON.parse(userData);
                  return { 
                    name: parsed.name || 'Jane Doe', 
                    email: parsed.email || 'jane@example.com', 
                    phone: '+1 555-0100' 
                  };
                }
                return { name: 'Jane Doe', email: 'jane@example.com', phone: '+1 555-0100' };
              })()} 
            />
          </div>
        </aside>
      </div>
        </>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            {(['all', 'active', 'completed', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRequestFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  requestFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Requests List */}
          {requestsLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-4 dark:border-slate-700">
                  <Skeleton className="h-5 w-1/3" />
                  <SkeletonText className="mt-2" lines={2} />
                </div>
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((request) => (
                <ServiceRequestCard
                  key={request.id}
                  request={request}
                  onBoostPrice={handleBoostPrice}
                  onCancel={handleCancelRequest}
                  viewType="buyer"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {requestFilter === 'all' ? 'No service requests yet' : `No ${requestFilter} requests`}
              </p>
              <Link
                to="/request-service"
                className="inline-block px-6 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                Create Your First Request
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Seller Profile Modal */}
      <SellerProfileModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        categoryName={selectedCategory || ''}
        sellers={sellers}
        loading={loadingSellers}
        selectedSeller={selectedSeller}
        onSellerSelect={handleSellerSelect}
        onSellerBack={handleSellerBack}
        onContact={handleContact}
      />

      {/* Price Boost Modal */}
      {selectedRequest && (
        <PriceBoostModal
          isOpen={showBoostModal}
          onClose={() => {
            setShowBoostModal(false);
            setSelectedRequest(null);
          }}
          currentPrice={selectedRequest.currentPrice}
          onConfirm={handleConfirmBoost}
          loading={boosting}
        />
      )}
    </section>
  );
};


