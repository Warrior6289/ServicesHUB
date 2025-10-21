import React from 'react';
import { ListingCard, type Listing } from '../components/ListingCard';
import { ListingForm, type ListingFormValues } from '../components/ListingForm';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { createListing as apiCreate, fetchSellerListings, removeListing as apiRemove, updateListing as apiUpdate } from '../api/services';
import { InstantRequestItem } from '../components/InstantRequestItem';
import { useServiceRequestPolling } from '../hooks/useServiceRequestPolling';
import { SellerProfileForm } from '../components/SellerProfileForm';
import { SellerStats } from '../components/SellerStats';
import { getSellerProfile, initializeSellerProfile, updateSellerProfile } from '../mocks/sellerProfile';
import type { SellerProfile } from '../types/seller';
// import { acceptRequest } from '../api/serviceRequests';
import { motion, AnimatePresence } from 'framer-motion';

type Message = { id: string; from: string; content: string; at: string };

export const SellerDashboardPage: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [showIncomingRequests, setShowIncomingRequests] = React.useState(true);
  const [acceptingId, setAcceptingId] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'distance' | 'price' | 'time'>('time');
  const [sellerProfile, setSellerProfile] = React.useState<SellerProfile | null>(null);
  
  // Polling for incoming service requests
  const {
    requests: incomingRequests,
    loading: requestsLoading,
    newRequestsCount,
    resetNewRequestsCount,
    refetch,
  } = useServiceRequestPolling({
    enabled: true, // Always poll when seller dashboard is open
    intervalMs: 20000, // Poll every 20 seconds
    radius: 50, // 50km radius
    useMockData: true, // Use mock data for development
  });

  // Seller's location (would come from profile in production)
  const sellerLocation = { lat: 40.7128, lng: -74.0060 };

  // Initialize seller profile
  React.useEffect(() => {
    const profile = initializeSellerProfile();
    setSellerProfile(profile);
  }, []);

  // Filter requests based on seller's service categories
  const relevantRequests = React.useMemo(() => {
    if (!sellerProfile?.serviceCategories?.length) {
      return [];
    }
    return incomingRequests.filter(request => 
      sellerProfile.serviceCategories.includes(request.categoryName)
    );
  }, [incomingRequests, sellerProfile]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const today = new Date().toDateString();
    const requestsToday = relevantRequests.filter(req => 
      new Date(req.createdAt).toDateString() === today
    ).length;
    
    const acceptedRequests = relevantRequests.filter(req => 
      ['accepted', 'in_progress', 'completed'].includes(req.status)
    ).length;
    
    const acceptanceRate = relevantRequests.length > 0 
      ? Math.round((acceptedRequests / relevantRequests.length) * 100)
      : 0;

    return {
      requestsToday,
      acceptanceRate,
      avgResponseTime: '1.2 hours',
      totalEarnings: 1250.75, // Mock data
    };
  }, [relevantRequests]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchSellerListings();
        if (mounted) {
          // Ensure we always set an array
          const listingsData = Array.isArray(data) ? data : [];
          setListings(listingsData);
        }
      } catch {
        if (mounted) {
          setListings([
            { id: 'l1', title: 'Pipe Installation', price: 120, status: 'available', views: 142, rating: 4.6, description: 'Residential pipe fitting' },
            { id: 'l2', title: 'AC Repair', price: 80, status: 'sold', views: 98, rating: 4.4, description: 'Split AC diagnostics and repair' },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [messages] = React.useState<Message[]>([
    { id: 'm1', from: 'Jane', content: 'Is the AC repair available this weekend?', at: new Date().toISOString() },
    { id: 'm2', from: 'Mark', content: 'Can you provide an invoice for the last job?', at: new Date(Date.now() - 3600000).toISOString() },
  ]);
  const [editing, setEditing] = React.useState<Listing | null>(null);

  const addListing = (values: ListingFormValues) => {
    const next: Listing = {
      id: Math.random().toString(36).slice(2),
      title: values.title,
      price: Number(values.price),
      description: values.description,
      status: 'available',
      views: 0,
      rating: 0,
    };
    setListings(prev => [next, ...prev]);
    apiCreate(values).catch(() => {/* keep optimistic */});
  };

  const saveListing = (values: ListingFormValues) => {
    if (!editing) return;
    setListings(prev => prev.map(l => l.id === editing.id ? { ...l, ...values, price: Number(values.price) } : l));
    const id = editing.id;
    setEditing(null);
    apiUpdate(id, values).catch(() => {/* keep optimistic */});
  };

  const toggleStatus = (id: string) => setListings(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'available' ? 'sold' : 'available' } : l));
  const removeListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    apiRemove(id).catch(() => {/* keep optimistic */});
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setAcceptingId(requestId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production: await acceptRequest(requestId);
      
      alert(`Request accepted! You can now view it in your accepted requests.`);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleProfileUpdate = (updatedProfile: Partial<SellerProfile>) => {
    const newProfile = updateSellerProfile(updatedProfile);
    setSellerProfile(newProfile);
  };

  const sortedRequests = [...relevantRequests].sort((a, b) => {
    if (sortBy === 'price') {
      return b.currentPrice - a.currentPrice;
    } else if (sortBy === 'distance') {
      // Calculate distances (simplified, would use actual calculation)
      return 0;
    } else {
      // Sort by time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <section className="max-w-none">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {sellerProfile?.name || 'Seller'}!
        </div>
      </div>

      {/* Statistics Cards */}
      <SellerStats {...stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Profile */}
        <div className="xl:col-span-1" data-profile-section>
          <SellerProfileForm 
            initial={sellerProfile || undefined}
            onSubmit={handleProfileUpdate}
          />
        </div>

        {/* Right Column - Requests and Listings */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          {/* Incoming Requests Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold">Relevant Service Requests</h2>
                {relevantRequests.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-sm font-bold self-start sm:self-auto"
                  >
                    {relevantRequests.length} matching your services
                  </motion.span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm dark:bg-slate-800"
                >
                  <option value="time">Newest First</option>
                  <option value="price">Highest Price</option>
                  <option value="distance">Nearest</option>
                </select>
                
                <button
                  onClick={() => setShowIncomingRequests(!showIncomingRequests)}
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                >
                  {showIncomingRequests ? 'Hide' : 'Show'} ({relevantRequests.length})
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showIncomingRequests && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {requestsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-4 dark:border-slate-700">
                          <Skeleton className="h-5 w-1/3" />
                          <SkeletonText className="mt-2" lines={3} />
                        </div>
                      ))}
                    </div>
                  ) : !sellerProfile?.serviceCategories?.length ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Service Categories Selected
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Please select your service categories in your profile to see relevant requests.
                      </p>
                      <button
                        onClick={() => {
                          const profileElement = document.querySelector('[data-profile-section]');
                          profileElement?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Update Profile
                      </button>
                    </div>
                  ) : sortedRequests.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {sortedRequests.map((request) => (
                        <InstantRequestItem
                          key={request.id}
                          request={request}
                          sellerLocation={sellerLocation}
                          onAccept={handleAcceptRequest}
                          accepting={acceptingId === request.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">No relevant requests at the moment</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        We're checking every 20 seconds for new requests matching your services
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Your Listings Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Service Listings</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 dark:border-slate-700">
                    <Skeleton className="h-5 w-1/3" />
                    <SkeletonText className="mt-2" lines={2} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listings.map(l => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    onToggleStatus={toggleStatus}
                    onEdit={(id) => setEditing(listings.find(x => x.id === id) ?? null)}
                    onRemove={removeListing}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add Listing Form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Listing' : 'Add New Listing'}</h2>
            <ListingForm
              initial={editing ? { title: editing.title, price: editing.price, description: editing.description } : undefined}
              onSubmit={editing ? saveListing : addListing}
            />
            {editing && (
              <button 
                className="mt-3 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" 
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Messages Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
            <div className="space-y-3">
              {messages.map(m => (
                <div key={m.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.from}</span>
                    <span className="text-slate-500">{new Date(m.at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


