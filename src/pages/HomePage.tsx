import React from 'react';
import { motion } from 'framer-motion';
import { CategoryCard } from '../components/CategoryCard';
import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';

// Service categories data
const serviceCategories = [
  {
    title: 'Plumbing',
    description: 'Expert plumbers for repairs, installations, and maintenance',
    rating: 4.8,
    icon: '🔧',
    image: 'https://images.unsplash.com/photo-1581578731548-c6d0f3e4c4a8?w=400&h=300&fit=crop'
  },
  {
    title: 'Electrical',
    description: 'Licensed electricians for all your electrical needs',
    rating: 4.9,
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop'
  },
  {
    title: 'Cleaning',
    description: 'Professional cleaning services for homes and offices',
    rating: 4.7,
    icon: '🧹',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
  },
  {
    title: 'Carpentry',
    description: 'Skilled carpenters for custom woodwork and repairs',
    rating: 4.6,
    icon: '🔨',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'
  },
  {
    title: 'HVAC',
    description: 'Heating, ventilation, and air conditioning specialists',
    rating: 4.8,
    icon: '🌡️',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'
  },
  {
    title: 'Landscaping',
    description: 'Beautiful gardens and outdoor spaces designed and maintained',
    rating: 4.5,
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  }
];

// Statistics data
const stats = [
  { number: '50K+', label: 'Services Completed', icon: '✅' },
  { number: '2.5K+', label: 'Active Professionals', icon: '👷' },
  { number: '98%', label: 'Customer Satisfaction', icon: '⭐' },
  { number: '< 2hrs', label: 'Average Response Time', icon: '⏱️' }
];

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Trusted Professionals
              <span className="block text-accent-200">For Every Job</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Connect with skilled professionals for all your home and business needs. 
              From quick fixes to major projects, we've got you covered.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/user-dashboard"
                  className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Popular Service Categories
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Choose from our most requested services
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CategoryCard
                  title={category.title}
                  description={category.description}
                  rating={category.rating}
                  icon={<span className="text-2xl">{category.icon}</span>}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Trusted by Thousands
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Our platform delivers exceptional results
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 p-8 text-white shadow-lg">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-500">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h2 className="text-3xl font-bold sm:text-4xl mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of satisfied customers and skilled professionals who trust our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    Find Services
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Offer Services
                  </Link>
                </>
              ) : (
                <Link
                  to="/user-dashboard"
                  className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg hover:bg-gray-50 transition-colors"
                >
                  Explore Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};


