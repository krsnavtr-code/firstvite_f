import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const TermsOfService = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <SEO 
        title="Terms of Service | FirstVITE"
        description="Review the Terms of Service for using FirstVITE's learning platform. Understand your rights and responsibilities as a user of our services."
        keywords="terms of service, terms and conditions, user agreement, FirstVITE terms, online learning terms"
        og={{
          title: 'Terms of Service | FirstVITE',
          description: `Last updated ${lastUpdated}. By using FirstVITE, you agree to these terms and conditions.`,
          type: 'article'
        }}
      />
      <div className="pb-16 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">Terms of Service</h1>
        <p className="text-black dark:text-white mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-black dark:text-white mb-6">
            Welcome to FirstVite. By accessing or using our website and services, you agree to be bound by these Terms of Service.
            Please read them carefully before using our services.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">1. Account Registration</h2>
          <p className="text-black dark:text-white mb-4">
            To access certain features of our service, you may be required to create an account. You agree to provide accurate and complete information and to keep this information updated.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">2. User Responsibilities</h2>
          <p className="text-black dark:text-white mb-4">
            You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for all activities that occur under your account.
          </p>
          <ul className="list-disc pl-6 text-black dark:text-white mb-6 space-y-2">
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Not use the service to transmit any harmful or illegal content</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">3. Intellectual Property</h2>
          <p className="text-black dark:text-white mb-4">
            All content on our platform, including text, graphics, logos, and course materials, is the property of FirstVite or its content suppliers and is protected by intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">4. Payments and Refunds</h2>
          <p className="text-black dark:text-white mb-4">
            All course purchases are subject to our refund policy. We offer a 14-day money-back guarantee for most courses, unless otherwise specified.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">5. Limitation of Liability</h2>
          <p className="text-black dark:text-white mb-4">
            FirstVite shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of our services.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">6. Termination</h2>
          <p className="text-black dark:text-white mb-4">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">7. Changes to Terms</h2>
          <p className="text-black dark:text-white mb-6">
            We reserve the right to modify these Terms at any time. We will provide notice of any changes by updating the "Last updated" date at the top of these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">8. Governing Law</h2>
          <p className="text-black dark:text-white mb-6">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">9. Contact Us</h2>
          <p className="text-black dark:text-white mb-6">
            If you have any questions about these Terms, please contact us at:
          </p>
          <address className="not-italic text-black dark:text-white mb-8">
            FirstVite<br />
            H-161 BSI Sector-63<br />
            Noida, Gautam Budh Nagar<br />
            Uttar Pradesh 201301<br />
            Email: info@firstvite.com
          </address>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TermsOfService;
