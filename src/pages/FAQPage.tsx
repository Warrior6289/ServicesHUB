import React from 'react';
import { motion } from 'framer-motion';
import { AccordionItem } from '../components/AccordionItem';
import { SearchBar } from '../components/SearchBar';
import { Link } from 'react-router-dom';

const faqData = {
  general: [
    {
      question: 'What is Services Hub?',
      answer: 'Services Hub is a marketplace platform connecting customers with trusted service professionals. We help you find, book, and pay for various services including plumbing, electrical work, cleaning, and more.',
    },
    {
      question: 'How do I get started?',
      answer: 'Simply sign up for a free account, browse our service categories, and connect with professionals in your area. You can book services directly through our platform.',
    },
    {
      question: 'Is Services Hub available in my area?',
      answer: 'We currently operate in major cities across the United States and are rapidly expanding. Check our service areas page or enter your zip code to see if we\'re available in your location.',
    },
    {
      question: 'How much does it cost to use Services Hub?',
      answer: 'Creating an account and browsing services is completely free for customers. You only pay for the services you book. Service providers pay a small commission on completed jobs.',
    },
  ],
  customers: [
    {
      question: 'How do I find a service provider?',
      answer: 'Browse our service categories, use the search function, or filter by location and ratings. You can view detailed profiles, portfolios, and reviews before making a decision.',
    },
    {
      question: 'Are service providers verified?',
      answer: 'Yes! All service providers undergo background checks and identity verification. We also verify licenses and certifications where applicable.',
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We have a satisfaction guarantee. If you\'re not happy with the service, contact us within 48 hours and we\'ll work with you and the provider to resolve the issue.',
    },
    {
      question: 'How do I pay for services?',
      answer: 'All payments are processed securely through our platform. We accept credit cards, debit cards, and PayPal. Payment is typically due upon service completion.',
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Yes, you can cancel bookings according to our cancellation policy. Cancellations made 24 hours before the scheduled service are typically free of charge.',
    },
  ],
  providers: [
    {
      question: 'How do I become a service provider?',
      answer: 'Sign up for a provider account, complete your profile with your skills and experience, submit verification documents, and create your service listings. Our team will review and approve your account within 2-3 business days.',
    },
    {
      question: 'What fees do service providers pay?',
      answer: 'We charge a commission on completed jobs ranging from 5-15% depending on your subscription plan. There are no upfront fees or monthly minimums on our free Starter plan.',
    },
    {
      question: 'How do I get paid?',
      answer: 'Payments are processed automatically after service completion. Funds are typically available in your account within 2-3 business days. You can withdraw to your bank account anytime.',
    },
    {
      question: 'How can I get more bookings?',
      answer: 'Maintain high ratings, respond quickly to inquiries, upload quality photos of your work, keep your availability updated, and consider our Premium plan for enhanced visibility.',
    },
    {
      question: 'Can I offer services in multiple categories?',
      answer: 'Yes! You can list services in multiple categories. Our Professional and Enterprise plans offer unlimited service listings.',
    },
  ],
  payments: [
    {
      question: 'Is my payment information secure?',
      answer: 'Absolutely. We use industry-standard encryption and comply with PCI DSS standards. Your payment information is never stored on our servers.',
    },
    {
      question: 'When am I charged for a service?',
      answer: 'Payment authorization occurs when you book a service, but the actual charge is processed only after the service is completed to your satisfaction.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer refunds in cases of service cancellation or if the service wasn\'t delivered as described. Refunds are processed within 5-7 business days.',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees! The price you see is the price you pay. Any additional costs must be agreed upon between you and the service provider before work begins.',
    },
  ],
  safety: [
    {
      question: 'How do you ensure provider safety and quality?',
      answer: 'All providers undergo background checks, identity verification, and license verification where applicable. We also monitor ratings and reviews closely.',
    },
    {
      question: 'What if there\'s a problem during service?',
      answer: 'Contact our 24/7 support immediately. We have protocols in place to handle disputes, safety concerns, and emergency situations.',
    },
    {
      question: 'Is insurance included?',
      answer: 'Many of our providers carry their own liability insurance. You can filter for insured providers when searching. We also offer optional protection plans for added peace of mind.',
    },
    {
      question: 'How do you handle disputes?',
      answer: 'Our mediation team reviews disputes between customers and providers. We examine evidence from both parties and work toward a fair resolution.',
    },
  ],
};

export const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'general', label: 'General' },
    { id: 'customers', label: 'For Customers' },
    { id: 'providers', label: 'For Providers' },
    { id: 'payments', label: 'Payments' },
    { id: 'safety', label: 'Safety & Trust' },
  ];

  const filteredFAQs = React.useMemo(() => {
    let faqs: Array<{ category: string; question: string; answer: string }> = [];
    
    if (selectedCategory === 'all') {
      Object.entries(faqData).forEach(([category, items]) => {
        items.forEach(item => {
          faqs.push({ category, ...item });
        });
      });
    } else {
      faqData[selectedCategory as keyof typeof faqData]?.forEach(item => {
        faqs.push({ category: selectedCategory, ...item });
      });
    }

    if (searchQuery) {
      faqs = faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return faqs;
  }, [selectedCategory, searchQuery]);

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
              Frequently Asked Questions
              <span className="block text-accent-200">Find Answers Quickly</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Browse our comprehensive FAQ to find answers to common questions about Services Hub.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-4xl px-4">
          <SearchBar
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            showFilter={true}
            filterOptions={categories.slice(1).map(c => c.label)}
            selectedFilter={categories.find(c => c.id === selectedCategory)?.label}
            onFilterChange={(label) => {
              const cat = categories.find(c => c.label === label);
              if (cat) setSelectedCategory(cat.id);
            }}
          />
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4">
          {filteredFAQs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
            >
              {filteredFAQs.map((faq, index) => (
                <AccordionItem
                  key={`${faq.category}-${index}`}
                  title={faq.question}
                  content={faq.answer}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-slate-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                We couldn't find any FAQs matching your search. Try different keywords.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear search and show all FAQs
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-block rounded-lg bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white font-semibold py-3 px-8 transition-all shadow-lg hover:shadow-xl"
              >
                Contact Support
              </Link>
              <Link
                to="/help"
                className="inline-block rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 text-slate-700 dark:text-slate-300 font-semibold py-3 px-8 transition-all"
              >
                Visit Help Center
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

