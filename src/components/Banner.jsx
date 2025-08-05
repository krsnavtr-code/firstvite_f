import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBookOpen,
  FaUsers,
  FaCertificate,
  FaPlay,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const bannerImg =
  "http://firstvite.com/api/upload/file/img-1752554019521-300496356.png";

const logoImg =
  "http://firstvite.com/api/upload/file/img-1753961989896-7541613.png";
import "./Banner.css";
import "../styles/typography.css";

const CertificateModal = ({ isOpen, onClose }) => {
  // Prevent right-click context menu
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (isOpen) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-[550px] w-full max-h-[550px] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white z-20"
        >
          <FaTimes className="text-2xl" />
        </button>
        <div className="p-6 relative">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Simple Certificate
          </h3>
          {/* Image Container with Protection */}
          <div className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)",
                mixBlendMode: "multiply",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-2xl font-bold text-gray-400 opacity-30 transform -rotate-45 select-none">
                SAMPLE CERTIFICATE
              </div>
            </div>
            <div className="relative">
              {/* This is a decoy element that will appear in dev tools */}
              <div
                className="hidden"
                data-decoysrc="ignore-this-decoysrc"
                style={{ display: "none" }}
              >
                <img
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                  alt=""
                />
              </div>

              {/* Actual image with obfuscated attributes */}
              <div
                className="certificate-image-container"
                style={{
                  backgroundImage:
                    "url('http://firstvite.com/api/upload/file/img-1754374737042-580116956.jpg')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "100%",
                  aspectRatio: "4/3",
                  filter: "blur(1px)",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  userSelect: "none",
                  pointerEvents: "none",
                  WebkitTouchCallout: "none",
                }}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Add some noise to make screenshotting harder */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
                  pointerEvents: "none",
                  mixBlendMode: "overlay",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Banner() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    const fetchCourseCount = async () => {
      const API_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:4002/api";
      try {
        const response = await axios.get(`${API_URL}/courses?fields=_id`);
        setCourseCount(response.data.length + 100);
      } catch (error) {
        console.error("Error fetching course count:", error);
      }
    };

    fetchCourseCount();
  }, []);

  const [showCertificate, setShowCertificate] = useState(false);

  const features = [
    {
      icon: <FaBookOpen className="text-2xl text-[#F47C26]" />,
      title: `${courseCount}+ Courses`,
      desc: "Wide range of topics",
    },
    {
      icon: <FaUsers className="text-2xl text-[#F47C26]" />,
      title: "Expert Instructors",
      desc: "Learn from the best",
    },
    {
      icon: <FaCertificate className="text-2xl text-[#F47C26]" />,
      title: "Certification",
      desc: "Get certified",
      onClick: () => setShowCertificate(true),
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-1 text-xl-mobile text-lg-tablet text-xl-desktop font-bold text-gray-900 dark:text-white leading-tight">
                <img src={logoImg} alt="logo" className="w-6" />
                <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  Be The First
                </span>
              </div>
              <div className="text-xl-mobile text-lg-tablet text-xl-desktop font-bold text-gray-900 dark:text-white leading-tight">
                <span className="whitespace-nowrap">Learn</span>
                <span className="text-[#F47C26] whitespace-nowrap">
                  {" "}
                  Anytime,
                </span>
              </div>
              <div className="text-xl-mobile text-lg-tablet text-xl-desktop font-bold text-gray-900 dark:text-white leading-tight">
                <div className="flex items-start">
                  <div className="w-12 xs:w-16 sm:w-20 md:w-24 flex-shrink-0"></div>
                  <div>
                    <span className="whitespace-nowrap">Grow</span>
                    <span className="text-[#F47C26] whitespace-nowrap">
                      {" "}
                      Every Day
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm-mobile text-base-tablet text-base-desktop text-thin text-black dark:text-white">
              No schedule limits, no boundaries. Learn anytime you choose and
              make progress every day with simple, effective online education
              built for real growth.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={feature.onClick}
                  className={`flex flex-nowrap items-start p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 border border-gray-100 dark:border-gray-700 ${
                    feature.onClick
                      ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                      : ""
                  }`}
                >
                  <div className="flex-shrink-0 p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full mr-3">
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-black dark:text-white text-[13px] sm:text-[15px] leading-tight">
                      {feature.title}
                    </h4>
                    <p className="text-[11px] sm:text-[13px] text-black dark:text-gray-400 leading-tight mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
              <Link
                to="/courses"
                className="group bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition duration-300 flex items-center w-full sm:w-auto justify-center"
              >
                <span>Start Learning</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-8 py-3 rounded-lg font-medium text-lg transition duration-300 flex items-center justify-center w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:w-1/2 mt-8 lg:mt-0">
            <div className="relative">
              <div className="w-[90%] hidden lg:block mx-auto mask-inset-corners hover:scale-105 transition-transform duration-500 shadow-xl dark:shadow-gray-900/50">
                <img
                  src={bannerImg}
                  alt="Online Learning"
                  className="w-full h-auto rounded-none"
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 right-20 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
          </div>
        </div>
      </div>
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
      />
    </div>
  );
}

export default Banner;
