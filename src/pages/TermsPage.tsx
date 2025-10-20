import React from 'react';
import { motion } from 'framer-motion';

export const TermsPage: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Services Hub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our platform.',
    },
    {
      id: 'accounts',
      title: '2. User Accounts',
      content: 'You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.',
    },
    {
      id: 'services',
      title: '3. Platform Services',
      content: 'Services Hub provides a marketplace platform connecting customers with service providers. We do not directly provide services ourselves. Service providers are independent contractors, not employees of Services Hub.',
    },
    {
      id: 'payments',
      title: '4. Payments and Fees',
      content: 'Customers agree to pay for services booked through the platform. Service providers agree to pay platform commissions as outlined in their subscription plan. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.',
    },
    {
      id: 'conduct',
      title: '5. User Conduct',
      content: 'Users agree not to engage in fraudulent, abusive, or illegal activities. This includes but is not limited to: providing false information, manipulating reviews, harassment, or violating intellectual property rights. We reserve the right to suspend or terminate accounts that violate these terms.',
    },
    {
      id: 'content',
      title: '6. Content and Intellectual Property',
      content: 'Users retain ownership of content they submit to the platform but grant Services Hub a license to use, display, and distribute this content. The Services Hub platform, including its design, features, and functionality, is owned by us and protected by copyright and trademark laws.',
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      content: 'Services Hub is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our liability is limited to the amount you paid for services through our platform in the past 12 months.',
    },
    {
      id: 'warranty',
      title: '8. Disclaimer of Warranties',
      content: 'The platform is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the platform will be error-free, uninterrupted, or secure. Service quality is the responsibility of individual service providers.',
    },
    {
      id: 'disputes',
      title: '9. Dispute Resolution',
      content: 'Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You agree to waive your right to participate in class action lawsuits.',
    },
    {
      id: 'termination',
      title: '10. Termination',
      content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms. You may terminate your account at any time by contacting support. Certain provisions of these terms survive termination.',
    },
    {
      id: 'modifications',
      title: '11. Modifications to Terms',
      content: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of modified terms.',
    },
    {
      id: 'governing',
      title: '12. Governing Law',
      content: 'These terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.',
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
              Terms of Service
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              Last updated: October 20, 2025
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="block w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Welcome to Services Hub. These Terms of Service ("Terms") govern your access to and use of our platform. Please read these terms carefully before using our services.
                </p>
              </div>

              {sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="mb-8 scroll-mt-24"
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {section.content}
                  </p>
                </motion.section>
              ))}

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6 mt-12">
                <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-3">
                  Contact Information
                </h3>
                <p className="text-primary-800 dark:text-primary-200 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="space-y-2 text-primary-800 dark:text-primary-200">
                  <li>Email: legal@serviceshub.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Service Street, Suite 100, New York, NY 10001</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

