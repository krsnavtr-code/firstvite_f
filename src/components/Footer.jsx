import React from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaBook,
  FaWhatsapp,
  FaFacebook,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  // Course data organized by categories
  const courseCategories = [
    {
      title: "Data Science and ML Courses",
      courses: [
        {
          name: "LLMOps Large Language Model Operations",
          url: "https://www.eklabya.com/course/large-language-model-operations",
        },
        {
          name: "Machine Learning & AI Certification",
          url: "https://www.eklabya.com/course/machine-learning-artificial-intelligence-certification",
        },
        {
          name: "MLOps Certification Training",
          url: "https://www.eklabya.com/course/machine-learning-operations-training",
        },
        {
          name: "Data Science & Analytics Certification",
          url: "https://www.eklabya.com/course/data-science-and-data-analytics-course",
        },
        {
          name: "Data Science Eklabya Program",
          url: "https://www.eklabya.com/course/data-analytics-certification-program",
        },
      ],
    },
    {
      title: "SAP Courses",
      courses: [
        {
          name: "SAP ABAP Certification Training",
          url: "https://www.eklabya.com/course/sap-abap-certification-training",
        },
        {
          name: "SAP FICO Financial Accounting",
          url: "https://www.eklabya.com/course/sap-fico-online-training",
        },
        {
          name: "SAP PP Production Planning",
          url: "https://www.eklabya.com/course/sap-pp-online-traning",
        },
        {
          name: "SAP SD Sales & Distribution",
          url: "https://www.eklabya.com/course/sap-sd-certification-training",
        },
        {
          name: "SAP MM Materials Management",
          url: "https://www.eklabya.com/course/sap-mm-online-training",
        },
      ],
    },
    {
      title: "Programming Languages Courses",
      courses: [
        {
          name: "Python Programming Mastery",
          url: "https://www.eklabya.com/course/python-programming-mastery-basics-to-advanced",
        },
        {
          name: "Java Programming Mastery",
          url: "https://www.eklabya.com/course/java-programming-mastery-basics-to-advanced",
        },
        {
          name: "RESTful Web Services API Design",
          url: "https://www.eklabya.com/course/restful-web-services-api-design-mastery",
        },
        {
          name: "SOAP Web Services Certification",
          url: "https://www.eklabya.com/course/soap-web-services-certification-training",
        },
        {
          name: "Node.js Backend Architecture",
          url: "https://www.eklabya.com/course/node-js-mastery-backend-architecture",
        },
        {
          name: "Java Web Services Enterprise",
          url: "https://www.eklabya.com/course/java-web-services-enterprise-integration",
        },
        {
          name: "Core Java Professional Training",
          url: "https://www.eklabya.com/course/core-java-mastery-professional-training",
        },
      ],
    },
    {
      title: "Full Stack Development Courses",
      courses: [
        {
          name: "Full Stack MERN Stack",
          url: "https://www.eklabya.com/course/full-stack-web-development-mern-stack",
        },
        {
          name: "Full Stack MERN Mastery",
          url: "https://www.eklabya.com/course/full-stack-web-development-mastery-mern-stack",
        },
        {
          name: "React Native Full Stack",
          url: "https://www.eklabya.com/course/react-native-full-stack-developer-mastery",
        },
        {
          name: "Full Stack Architect Path",
          url: "https://www.eklabya.com/course/full-stack-web-development-mastery-architect-path",
        },
        {
          name: "Frontend Web Development React",
          url: "https://www.eklabya.com/course/frontend-web-development-react-js",
        },
        {
          name: "Frontend Mastery HTML CSS JS React",
          url: "https://www.eklabya.com/course/frontend-web-development",
        },
        {
          name: "Microsoft .NET Full Stack",
          url: "https://www.eklabya.com/course/microsoft-dotnet-full-stack-developer-mastery",
        },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 text-black dark:text-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
      {/* Footer Top for Internal Link */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Popular Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {courseCategories.map((category, index) => (
              <div key={index}>
                <h4 className="text-sm font-semibold mb-4">{category.title}</h4>
                <ul className="space-y-2">
                  {category.courses.map((course, courseIndex) => (
                    <li key={courseIndex}>
                      <a
                        href={course.url}
                        className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {course.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-black dark:text-white tracking-wider uppercase">
              About Us
            </h3>
            <p className="text-base text-black dark:text-white">
              Empowering learners with high-quality courses and resources to
              achieve their educational goals.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/919891030303"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-orange-400 dark:hover:text-orange-400"
              >
                <FaWhatsapp className="h-6 w-6" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-orange-400 dark:hover:text-orange-400"
              >
                <FaTwitter className="h-6 w-6" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-orange-400 dark:hover:text-orange-400"
              >
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-orange-400 dark:hover:text-orange-400"
              >
                <FaFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/courses"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/testimonials"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/faq"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/payment-terms-and-conditions"
                  className="text-base text-black hover:text-orange-600 dark:text-white dark:hover:text-orange-400"
                >
                  Payment T&C
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-black dark:text-white tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center">
                <svg
                  className="h-12 w-12 text-black dark:text-white mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-400 text-xs">
                  H-161 BSI Business Park Sector-63 Noida Gautam Budh Nagar
                  Uttar Pradesh 201301
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-12 w-12 text-black dark:text-white mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h6m5 8l-5-5H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v12z"
                  />
                </svg>
                <span className="text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-400 text-xs">
                  I hereby agree to receive the promotional emails & messages
                  through WhatApp/RCS/SMS{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    T&C
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-black dark:text-white mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.12 3.37a1 1 0 01-.24 1.04l-2.06 2.06a16 16 0 006.59 6.59l2.06-2.06a1 1 0 011.04-.24l3.37 1.12a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V6a2 2 0 012-1z"
                  />
                </svg>
                <span className="text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                  <a href="tel:+919891030303">Phone: +91 9891030303</a>
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-black dark:text-white mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                  <a href="mailto:info@eklabya.com">Email: info@eklabya.com</a>
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-5 w-5 text-black dark:text-white mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                  <a href="mailto:anand@eklabya.com">
                    Email: anand@eklabya.com
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-black dark:text-white">
              &copy; {currentYear} eKlabya. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <FaBook className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-black dark:text-white">
                Learn something new today
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
