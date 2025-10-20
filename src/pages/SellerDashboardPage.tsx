import React from 'react';
import { ListingCard, type Listing } from '../components/ListingCard';
import { ListingForm, type ListingFormValues } from '../components/ListingForm';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { createListing as apiCreate, fetchSellerListings, removeListing as apiRemove, updateListing as apiUpdate } from '../api/services';

type Message = { id: string; from: string; content: string; at: string };

export const SellerDashboardPage: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [listings, setListings] = React.useState<Listing[]>([]);
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

  return (
    <section className="max-w-none">
      <h1 className="text-2xl font-semibold">Seller Dashboard</h1>

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


