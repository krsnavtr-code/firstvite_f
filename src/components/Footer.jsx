import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin, FaBook, FaWhatsapp, FaFacebook } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
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
                href="https://wa.me/919990056799"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-400 dark:hover:text-pink-400"
              >
                <FaWhatsapp className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-400 dark:hover:text-pink-400"
              >
                <FaTwitter className="h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-400 dark:hover:text-pink-400"
              >
                <FaLinkedin className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-400 dark:hover:text-pink-400"
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
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  Blog
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
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/payment-t-and-c"
                  className="text-base text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
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
                  className="h-5 w-5 text-black mr-2"
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
                <span className="text-black dark:text-white">
                  info@FirstVite.com
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-12 w-12 text-black mr-2"
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
                <span className="text-black dark:text-white">
                  H-161 BSI Business Park Sector-63 Noida Gautam Budh Nagar Uttar Pradesh 201301
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-black dark:text-white">
              &copy; {currentYear} FirstVite. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <FaBook className="h-5 w-5 text-pink-500 mr-2" />
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
