import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const CookiesPage: React.FC = () => {
  const cookieTypes = [
    {
      title: 'Essential Cookies',
      description: 'These cookies are necessary for the platform to function and cannot be disabled in our systems. They are usually only set in response to actions you take such as setting your privacy preferences, logging in, or filling in forms.',
      examples: [
        'Authentication and session management',
        'Security features',
        'Load balancing',
        'Form data retention',
      ],
      required: true,
    },
    {
      title: 'Performance Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our platform. They help us understand which pages are the most and least popular and see how visitors move around the platform.',
      examples: [
        'Google Analytics',
        'Page load times',
        'Error tracking',
        'Usage statistics',
      ],
      required: false,
    },
    {
      title: 'Functional Cookies',
      description: 'These cookies enable the platform to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
      examples: [
        'Language preferences',
        'Theme preferences (light/dark mode)',
        'Location settings',
        'Saved searches and filters',
      ],
      required: false,
    },
    {
      title: 'Targeting/Advertising Cookies',
      description: 'These cookies may be set through our platform by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant ads on other sites.',
      examples: [
        'Retargeting campaigns',
        'Social media advertising',
        'Interest-based advertising',
        'Ad performance measurement',
      ],
      required: false,
    },
  ];

  const browserGuides = [
    {
      name: 'Google Chrome',
      instructions: 'Settings > Privacy and Security > Cookies and other site data',
    },
    {
      name: 'Mozilla Firefox',
      instructions: 'Options > Privacy & Security > Cookies and Site Data',
    },
    {
      name: 'Safari',
      instructions: 'Preferences > Privacy > Manage Website Data',
    },
    {
      name: 'Microsoft Edge',
      instructions: 'Settings > Privacy, search, and services > Cookies and site permissions',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Cookie Policy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Last updated: October 20, 2025
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            What Are Cookies?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Cookies are small text files that are placed on your device when you visit our platform. They are widely used to make websites work more efficiently and provide information to the owners of the site.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information. This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.
          </p>
        </motion.div>

        {/* Cookie Types */}
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center"
          >
            Types of Cookies We Use
          </motion.h2>
          
          <div className="space-y-6">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {type.title}
                  </h3>
                  {type.required ? (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-semibold rounded-full">
                      Required
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {type.description}
                </p>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Examples:
                  </h4>
                  <ul className="space-y-1">
                    {type.examples.map((example, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Managing Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Managing Your Cookie Preferences
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the "Cookie Settings" link in our footer or by setting your browser to refuse some or all cookies.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>Note:</strong> If you choose to reject essential cookies, some features of our platform may not function properly.
            </p>
          </div>
        </motion.div>

        {/* Browser Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Browser Cookie Settings
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:
          </p>
          <div className="space-y-4">
            {browserGuides.map((browser) => (
              <div key={browser.name} className="flex items-start pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-4">
                  {browser.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {browser.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {browser.instructions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Third-Party Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Third-Party Cookies
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide social media features. These cookies are subject to the respective privacy policies of these external services.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            For more information about how these third parties use cookies, please visit their respective privacy policies.
          </p>
        </motion.div>

        {/* Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Updates to This Policy
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please review this policy periodically for any updates.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6"
        >
          <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-3">
            Questions About Cookies?
          </h3>
          <p className="text-primary-800 dark:text-primary-200 mb-4">
            If you have any questions about our use of cookies, please contact us or review our{' '}
            <Link to="/privacy" className="underline hover:text-primary-600 dark:hover:text-primary-400">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-primary-800 dark:text-primary-200">
            Email: privacy@serviceshub.com
          </p>
        </motion.div>
      </div>
    </div>
  );
};

