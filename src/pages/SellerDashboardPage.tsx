import React from 'react';
import { ListingCard, type Listing } from '../components/ListingCard';
import { ListingForm, type ListingFormValues } from '../components/ListingForm';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { createListing as apiCreate, fetchSellerListings, removeListing as apiRemove, updateListing as apiUpdate } from '../api/services';
import { InstantRequestItem } from '../components/InstantRequestItem';
import { useServiceRequestPolling } from '../hooks/useServiceRequestPolling';
// import { acceptRequest } from '../api/serviceRequests';
import { motion, AnimatePresence } from 'framer-motion';

type Message = { id: string; from: string; content: string; at: string };

export const SellerDashboardPage: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [showIncomingRequests, setShowIncomingRequests] = React.useState(true);
  const [acceptingId, setAcceptingId] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'distance' | 'price' | 'time'>('time');
  
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

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchSellerListings();
        if (mounted) setListings(data as any);
      } catch {
        setListings([
          { id: 'l1', title: 'Pipe Installation', price: 120, status: 'available', views: 142, rating: 4.6, description: 'Residential pipe fitting' },
          { id: 'l2', title: 'AC Repair', price: 80, status: 'sold', views: 98, rating: 4.4, description: 'Split AC diagnostics and repair' },
        ]);
      } finally {
        setLoading(false);
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

  const sortedRequests = [...incomingRequests].sort((a, b) => {
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
      <h1 className="text-2xl font-semibold">Seller Dashboard</h1>

      {/* Incoming Requests Section */}
      <div className="mt-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Incoming Instant Requests</h2>
            {newRequestsCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold animate-pulse"
              >
                {newRequestsCount} New!
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-3">
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
              onClick={() => {
                setShowIncomingRequests(!showIncomingRequests);
                if (!showIncomingRequests) resetNewRequestsCount();
              }}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
            >
              {showIncomingRequests ? 'Hide' : 'Show'} ({incomingRequests.length})
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-4 dark:border-slate-700">
                      <Skeleton className="h-5 w-1/3" />
                      <SkeletonText className="mt-2" lines={3} />
                    </div>
                  ))}
                </div>
              ) : sortedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">No incoming requests at the moment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    We're checking every 20 seconds for new requests
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Your Listings</h2>
            </div>
            {loading ? (
              <div className="mt-4 grid grid-cols-1 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 dark:border-slate-700">
                    <Skeleton className="h-5 w-1/3" />
                    <SkeletonText className="mt-2" lines={2} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4">
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
        </div>
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border p-4 dark:border-slate-700">
            <h2 className="text-lg font-medium">{editing ? 'Edit Listing' : 'Add Listing'}</h2>
            <div className="mt-3">
              <ListingForm
                initial={editing ? { title: editing.title, price: editing.price, description: editing.description } : undefined}
                onSubmit={editing ? saveListing : addListing}
              />
              {editing ? (
                <button className="mt-3 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setEditing(null)}>Cancel</button>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border p-4 dark:border-slate-700">
            <h2 className="text-lg font-medium">Messages</h2>
            <div className="mt-3 space-y-3">
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
        </aside>
      </div>
    </section>
  );
};


