import React from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '../components/SearchBar';
import { Link } from 'react-router-dom';

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using Services Hub',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    articleCount: 12,
  },
  {
    title: 'Account Management',
    description: 'Manage your profile, settings, and preferences',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    articleCount: 8,
  },
  {
    title: 'Payments & Billing',
    description: 'Understand payments, invoices, and refunds',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    articleCount: 15,
  },
  {
    title: 'Booking Services',
    description: 'How to find, book, and manage services',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    articleCount: 10,
  },
  {
    title: 'Service Providers',
    description: 'Information for professionals offering services',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    articleCount: 18,
  },
  {
    title: 'Safety & Security',
    description: 'Stay safe and protect your information',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    articleCount: 9,
  },
];

const popularArticles = [
  'How to create an account and get started',
  'Finding the right service provider for your needs',
  'Understanding our payment process',
  'How to leave a review for a service provider',
  'What to do if you need to cancel a booking',
  'How to become a verified service provider',
  'Setting up your service provider profile',
  'Best practices for getting more bookings',
];

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Help Center
              <span className="block text-accent-200">How Can We Help You?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Search our knowledge base for guides, tutorials, and answers to common questions.
            </p>
            <div className="mt-10 mx-auto max-w-2xl">
              <SearchBar
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Choose a category to explore relevant help articles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {category.articleCount} articles
                  </span>
                  <svg
                    className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
              Popular Articles
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Most viewed and helpful articles
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group flex items-start gap-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {article}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
              Video Tutorials
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Watch step-by-step guides to get the most out of Services Hub
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with Services Hub', duration: '3:45' },
              { title: 'How to Book Your First Service', duration: '5:20' },
              { title: 'Setting Up Your Provider Profile', duration: '6:15' },
            ].map((video, index) => (
              <motion.div
                key={video.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden aspect-video mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
                  <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {video.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
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
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Our support team is available 24/7 to help you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                to="/faq"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-primary-600 transition-colors"
              >
                View FAQ
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

