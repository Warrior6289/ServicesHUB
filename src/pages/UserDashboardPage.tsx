import React from 'react';
import { ServiceItemCard, type PurchasedService } from '../components/ServiceItemCard';
import { ProfileForm } from '../components/ProfileForm';
import { CategoryCard } from '../components/CategoryCard';
import { SellerProfileModal } from '../components/SellerProfileModal';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { fetchUserPurchased, submitServiceReview, fetchSellersByCategory } from '../api/services';
import type { SellerProfile } from '../types/seller';

export const UserDashboardPage: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [services, setServices] = React.useState<PurchasedService[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  
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
      setSellers(data);
    } catch (error) {
      console.error('Failed to fetch sellers:', error);
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

  return (
    <section className="max-w-none">
      <h1 className="text-2xl font-semibold">Your Dashboard</h1>

      {/* Categories Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Browse Service Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CategoryCard 
            title="Plumber" 
            description="Leaks, installations, repairs" 
            rating={4.7} 
            onClick={() => handleCategoryClick('Plumber')}
          />
          <CategoryCard 
            title="Electrician" 
            description="Wiring, lighting, panels" 
            rating={4.5} 
            onClick={() => handleCategoryClick('Electrician')}
          />
          <CategoryCard 
            title="Welder" 
            description="Fabrication, metal repairs" 
            rating={4.4} 
            onClick={() => handleCategoryClick('Welder')}
          />
          <CategoryCard 
            title="Carpenter" 
            description="Furniture, frames, fittings" 
            rating={4.2} 
            onClick={() => handleCategoryClick('Carpenter')}
          />
          <CategoryCard 
            title="Technician" 
            description="Appliances, diagnostics" 
            rating={4.6} 
            onClick={() => handleCategoryClick('Technician')}
          />
          <CategoryCard 
            title="Painter" 
            description="Interior, exterior, finishing" 
            rating={4.3} 
            onClick={() => handleCategoryClick('Painter')}
          />
          <CategoryCard 
            title="HVAC" 
            description="Heating, ventilation, AC" 
            rating={4.5} 
            onClick={() => handleCategoryClick('HVAC')}
          />
          <CategoryCard 
            title="Cleaning" 
            description="Home, office, deep clean" 
            rating={4.1} 
            onClick={() => handleCategoryClick('Cleaning')}
          />
        </div>
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
    </section>
  );
};


