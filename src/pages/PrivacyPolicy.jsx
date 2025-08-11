import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <SEO 
        title="Privacy Policy | FirstVITE"
        description="Read our Privacy Policy to understand how FirstVITE collects, uses, and protects your personal information. Last updated on your visit."
        keywords="privacy policy, data protection, personal information, FirstVITE privacy, online learning privacy, data security"
        og={{
          title: 'Privacy Policy | FirstVITE',
          description: `Last updated ${lastUpdated}. Learn how FirstVITE protects your privacy and handles your personal information.`,
          type: 'article'
        }}
      />
      <div className="pb-16 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-black dark:text-white mb-4">
            At FirstVite, we are committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy
            Policy outlines how we collect, use, and safeguard your information
            when you use our platform.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            1. How We Use Your Information
          </h2>
          <p className="text-black dark:text-white mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-black dark:text-white mb-6 space-y-2">
            <li>Provide and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Personalize your learning experience</li>
            <li>Communicate with you about courses, updates, and offers</li>
            <li>Ensure platform security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            2. Data Security
          </h2>
          <p className="text-black dark:text-white mb-6">
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, disclosure, or
            destruction. However, no internet transmission or electronic storage
            is 100% secure, so we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            3. Your Rights
          </h2>
          <p className="text-black dark:text-white mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-black dark:text-white mb-6 space-y-2">
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent where applicable</li>
          </ul>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            4. Third-Party Services
          </h2>
          <p className="text-black dark:text-white mb-6">
            We may use third-party services (e.g., payment processors,
            analytics) that have their own privacy policies. We encourage you to
            review these policies when accessing their services.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            5. Payments and Refunds
          </h2>
          <p className="text-black dark:text-white mb-6">
            All course purchases are subject to our refund policy. We offer a
            14-day money-back guarantee for most courses, unless otherwise
            specified.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            6. Changes to This Policy
          </h2>
          <p className="text-black dark:text-white mb-6">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-semibold text-black dark:text-white mt-8 mb-4">
            7. Contact Us
          </h2>
          <p className="text-black dark:text-white mb-6">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <address className="not-italic text-black dark:text-white mb-8">
            FirstVite
            <br />
            H-161 BSI Sector-63
            <br />
            Noida, Gautam Budh Nagar
            <br />
            Uttar Pradesh 201301
            <br />
            Email: info@firstvite.com
          </address>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
