import React from 'react';
import { motion } from 'framer-motion';

export const PrivacyPage: React.FC = () => {
  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: 'Services Hub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully.',
    },
    {
      id: 'information-collection',
      title: '2. Information We Collect',
      content: 'We collect information that you provide directly to us, including: account information (name, email, password), profile information, payment information, service booking details, messages and communications, and photos or documents you upload. We also automatically collect certain information about your device and how you interact with our platform, including IP address, browser type, pages visited, and usage patterns.',
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      content: 'We use the information we collect to: provide and maintain our services, process transactions and send related information, send administrative messages and updates, respond to your inquiries and provide customer support, personalize your experience, improve our platform and develop new features, detect and prevent fraud and abuse, comply with legal obligations, and send marketing communications (with your consent).',
    },
    {
      id: 'sharing',
      title: '4. How We Share Your Information',
      content: 'We may share your information with: service providers who perform services on our behalf, other users as necessary to facilitate services, business partners with your consent, law enforcement when required by law, potential buyers in the event of a merger or acquisition. We do not sell your personal information to third parties.',
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
    },
    {
      id: 'cookies',
      title: '6. Cookies and Tracking Technologies',
      content: 'We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.',
    },
    {
      id: 'your-rights',
      title: '7. Your Privacy Rights',
      content: 'Depending on your location, you may have certain rights regarding your personal information, including: the right to access your personal data, the right to rectify inaccurate data, the right to erase your data, the right to restrict processing, the right to data portability, the right to object to processing, the right to withdraw consent. To exercise these rights, please contact us using the information provided below.',
    },
    {
      id: 'data-retention',
      title: '8. Data Retention',
      content: 'We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.',
    },
    {
      id: 'international',
      title: '9. International Data Transfers',
      content: 'Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. We ensure appropriate safeguards are in place for such transfers.',
    },
    {
      id: 'children',
      title: '10. Children\'s Privacy',
      content: 'Our platform is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
    },
    {
      id: 'california',
      title: '11. California Privacy Rights',
      content: 'California residents have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete personal information, the right to opt-out of the sale of personal information (note: we do not sell personal information), and the right to non-discrimination for exercising your rights.',
    },
    {
      id: 'gdpr',
      title: '12. GDPR Compliance',
      content: 'For users in the European Economic Area (EEA), we process personal data in accordance with the General Data Protection Regulation (GDPR). Our lawful bases for processing include: consent, contract performance, legal obligations, and legitimate interests. You have the right to lodge a complaint with your local data protection authority.',
    },
    {
      id: 'updates',
      title: '13. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.',
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
              Privacy Policy
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
                  Your privacy is important to us. This Privacy Policy explains how Services Hub collects, uses, and protects your personal information in compliance with applicable privacy laws including GDPR and CCPA.
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
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </motion.section>
              ))}

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6 mt-12">
                <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100 mb-3">
                  Contact Us About Privacy
                </h3>
                <p className="text-primary-800 dark:text-primary-200 mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices:
                </p>
                <ul className="space-y-2 text-primary-800 dark:text-primary-200">
                  <li>Email: privacy@serviceshub.com</li>
                  <li>Data Protection Officer: dpo@serviceshub.com</li>
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

