import React from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from '../components/PricingCard';
import { AccordionItem } from '../components/AccordionItem';
import { useNavigate } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();

  const pricingPlans = {
    customer: [
      {
        title: 'Free',
        price: 'Free',
        description: 'Perfect for occasional service needs',
        features: [
          'Browse all service categories',
          'View provider profiles',
          'Read reviews and ratings',
          'Basic customer support',
          'Book up to 3 services/month',
        ],
      },
      {
        title: 'Premium',
        price: billingCycle === 'monthly' ? '$9.99' : '$99',
        period: billingCycle === 'monthly' ? '/month' : '/year',
        description: 'Best for regular service users',
        features: [
          'Everything in Free',
          'Unlimited service bookings',
          'Priority customer support',
          'Exclusive discounts (up to 15%)',
          'Schedule recurring services',
          'Early access to new providers',
        ],
        popular: true,
      },
      {
        title: 'Business',
        price: 'Custom',
        description: 'For businesses with multiple locations',
        features: [
          'Everything in Premium',
          'Dedicated account manager',
          'Bulk booking discounts',
          'Custom invoicing',
          'Team management features',
          'API access',
        ],
      },
    ],
    provider: [
      {
        title: 'Starter',
        price: 'Free',
        description: 'Get started with your service business',
        features: [
          'Create professional profile',
          'List up to 3 services',
          '15% platform commission',
          'Basic analytics',
          'Standard support',
        ],
      },
      {
        title: 'Professional',
        price: billingCycle === 'monthly' ? '$29.99' : '$299',
        period: billingCycle === 'monthly' ? '/month' : '/year',
        description: 'For growing service providers',
        features: [
          'Everything in Starter',
          'Unlimited service listings',
          '10% platform commission',
          'Advanced analytics & insights',
          'Priority listing in search',
          'Verified badge',
          'Priority support',
        ],
        popular: true,
      },
      {
        title: 'Enterprise',
        price: 'Custom',
        description: 'For large service businesses',
        features: [
          'Everything in Professional',
          '5% platform commission',
          'Custom branding options',
          'Team collaboration tools',
          'Dedicated account manager',
          'White-label solutions',
          'API integration',
        ],
      },
    ],
  };

  const [selectedTab, setSelectedTab] = React.useState<'customer' | 'provider'>('customer');

  const faqItems = [
    {
      title: 'How does the free trial work?',
      content: 'All premium plans come with a 14-day free trial. You can cancel anytime during the trial period without being charged.',
    },
    {
      title: 'Can I change my plan later?',
      content: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
    },
    {
      title: 'What payment methods do you accept?',
      content: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans.',
    },
    {
      title: 'What is the platform commission?',
      content: 'For service providers, we charge a commission on completed jobs. The rate varies by plan: 15% for Starter, 10% for Professional, and 5% for Enterprise.',
    },
    {
      title: 'Is there a cancellation fee?',
      content: 'No, there are no cancellation fees. You can cancel your subscription at any time, and you\'ll retain access until the end of your billing period.',
    },
    {
      title: 'Do you offer refunds?',
      content: 'We offer a 30-day money-back guarantee for annual plans. Monthly subscriptions can be canceled anytime without penalty.',
    },
  ];

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
              Simple, Transparent Pricing
              <span className="block text-accent-200">Plans That Grow With You</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90">
              Choose the perfect plan for your needs. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab Selection */}
      <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setSelectedTab('customer')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'customer'
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              For Customers
            </button>
            <button
              onClick={() => setSelectedTab('provider')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'provider'
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              For Service Providers
            </button>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Annual <span className="text-green-600 dark:text-green-400">(Save 20%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans[selectedTab].map((plan) => (
              <PricingCard
                key={plan.title}
                {...plan}
                onCtaClick={() => navigate('/signup')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.title}
                title={item.title}
                content={item.content}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
              Still Have Questions?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

