import React from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaBook,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  // Course data organized by categories
  const courseCategories = [
    {
      title: "Data Science & ML",
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
          name: "Data Science, Analytics & Power BI Program",
          url: "https://www.eklabya.com/course/data-science-and-power-bi",
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
      title: "Programming Languages",
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
      title: "Full Stack Development",
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
    <footer className="bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-200 border-t border-slate-200 dark:border-slate-800 mt-12 transition-colors duration-300 text-xs sm:text-sm">
      {/* Footer Top for Popular Courses */}
      <div className="bg-white dark:bg-gray-800/80 border-b border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-center">
            Popular Course Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <h4 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  {category.title}
                </h4>
                <ul className="space-y-1.5">
                  {category.courses.map((course, courseIndex) => (
                    <li key={courseIndex}>
                      <a
                        href={course.url}
                        className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
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

      {/* Main Footer Links & About */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-wider uppercase">
              About Us
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Empowering learners with high-quality courses and resources to
              achieve their educational and career goals.
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                {
                  icon: FaWhatsapp,
                  href: "https://wa.me/919891030303?text=Hi%2C%20I%20am%20interested%20in%20learning%20more%20about%20your%20courses.",
                },
                { icon: FaTwitter, href: "https://x.com/eklabyaofficial" },
                {
                  icon: FaLinkedin,
                  href: "https://www.linkedin.com/company/eklabya-centre-of-excellence/",
                },
                {
                  icon: FaFacebook,
                  href: "https://www.facebook.com/profile.php?id=61589473389916",
                },
                {
                  icon: FaInstagram,
                  href: "https://www.instagram.com/eklabya_official",
                },
                {
                  icon: FaPinterest,
                  href: "https://in.pinterest.com/eklabyaofficial",
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-gray-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-2xs"
                >
                  <social.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Browse Courses", to: "/courses" },
                { name: "About Us", to: "/about" },
                { name: "Contact", to: "/contact" },
                { name: "Blog", to: "/blog" },
                { name: "Testimonials", to: "/testimonials" },
                { name: "Awards", to: "/awards" },
                { name: "Media Mentions", to: "/media-mentions" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-wider uppercase">
              Resources
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Privacy Policy", to: "/privacy-policy" },
                { name: "Terms of Service", to: "/terms-of-service" },
                { name: "FAQs", to: "/faq" },
                { name: "Payment T&C", to: "/payment-terms-and-conditions" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  G-25, Block G, Sector 3, Noida,
                  Uttar Pradesh 201301
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaPhone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <a
                  href="tel:+919891030303"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  +91 9891030303
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <a
                  href="mailto:info@eklabya.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  info@eklabya.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <a
                  href="mailto:anand@eklabya.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  anand@eklabya.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Consent Notice Note */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          <p>
            I hereby agree to receive the promotional emails & messages through
            WhatsApp/RCS/SMS{" "}
            <Link
              to="/terms-of-service"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              T&C
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {currentYear} eKlabya. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <FaBook className="h-4 w-4 text-blue-500" />
            <span>Learn something new today</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
