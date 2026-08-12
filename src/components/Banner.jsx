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
  "https://www.eklabya.com/api/upload/file/Home-Page-Image-9212.png";
const logoImg = "https://www.eklabya.com/api/upload/file/eKlabya-0644.png";

import "./Banner.css";
import "../styles/typography.css";

const CertificateModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (isOpen) e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-[500px] w-full max-h-[500px] overflow-auto relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white z-20 transition-all"
        >
          <FaTimes className="text-sm" />
        </button>
        <div className="p-5 relative">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            Verified Certificate
          </h3>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)",
                mixBlendMode: "multiply",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-xl font-black text-gray-400/40 transform -rotate-45 select-none tracking-widest">
                SAMPLE CERTIFICATE
              </div>
            </div>
            <div
              className="certificate-image-container"
              style={{
                backgroundImage:
                  "url('http://eklabya.com/api/upload/file/eklabya-certificate-4563.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: "100%",
                aspectRatio: "4/3",
                filter: "blur(1px)",
                userSelect: "none",
                pointerEvents: "none",
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function Banner() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseCount, setCourseCount] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const fetchCourseCount = async () => {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      try {
        const response = await axios.get(`${API_URL}/courses?fields=_id`);
        setCourseCount(response.data.length + 100);
      } catch (error) {
        console.error("Error fetching course count:", error);
      }
    };
    fetchCourseCount();
  }, []);

  const features = [
    {
      icon: <FaBookOpen className="text-lg text-blue-600 dark:text-blue-400" />,
      title: "180+ Courses",
      desc: "Across IT, data, business & design",
    },
    {
      icon: (
        <FaUsers className="text-lg text-emerald-600 dark:text-emerald-400" />
      ),
      title: "Expert Mentors",
      desc: "Industry practitioners, not just trainers",
    },
    {
      icon: (
        <FaCertificate className="text-lg text-amber-600 dark:text-amber-400" />
      ),
      title: "ISO & NSDC/NIELIT Certification",
      desc: "Recognized, verifiable credentials",
      onClick: () => setShowCertificate(true),
    },
    {
      icon: (
        <FaArrowRight className="text-lg text-purple-600 dark:text-purple-400" />
      ),
      title: "98% Placement Support Rate",
      desc: "Real outcomes, not just promises",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-6 md:py-10 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="lg:w-[55%] space-y-4">
            {/* Top Badge */}
            <div className="inline-flex items-center">
              <span className="text-blue-600 dark:text-blue-400 tracking-wider font-extrabold uppercase text-[11px] md:text-xs bg-blue-100/80 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs">
                ✦ Career Acceleration Platform
              </span>
            </div>

            {/* --- REFINED PREMIUM STAIRCASE DESIGN --- */}
            <div className="space-y-2 w-full font-sans">
              <h1 className="flex flex-col space-y-2 tracking-tight text-xl sm:text-2xl md:text-3xl font-black">
                {/* Step 1 */}
                <span className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 shrink-0"></span>
                  <span>
                    Learn{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      Job-Ready Skills.
                    </span>
                  </span>
                </span>

                {/* Step 2 (Slightly Indented) */}
                <span className="flex items-center gap-3 pl-5 sm:pl-8 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950 shrink-0"></span>
                  <span>Get Certified.</span>
                </span>

                {/* Step 3 (Further Indented) */}
                <span className="flex items-center gap-3 pl-10 sm:pl-16 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 animate-pulse shrink-0"></span>
                  <span>Get Hired. 🚀</span>
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl pt-1">
              Eklabya is an ISOcertified, NSDC & NIELITrecognized online learning platform helping students and working professionals build in-demand skills in IT, data, business, and design, with live mentorship, handson projects, and dedicated placement support. No fixed schedules, no boundaries, just structured, career-focused learning you can start today.

            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={feature.onClick}
                  className={`flex flex-col p-2.5 bg-white dark:bg-gray-800/90 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 ${
                    feature.onClick
                      ? "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 shadow-sm"
                      : ""
                  }`}
                >
                  <div className="mb-1.5">{feature.icon}</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row items-center gap-3 pt-2">
              <Link
                to="/courses"
                className="group bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-6 py-1.5 md:py-3 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center shadow-md shadow-blue-600/20"
              >
                <span>Start Learning</span>
                <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/courses"
                className="border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-2 md:px-6 py-1.5 md:py-3 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center bg-white/50 dark:bg-gray-800/50"
              >
                Explore Career Paths
              </Link>
            </div>
          </div>

          {/* Right Content - Banner Image */}
          <div className="lg:w-[45%] flex justify-center mt-6 lg:mt-0">
            <div className="relative w-full max-w-[400px]">
              {/* Image Card Container with Smooth Rounded Corners & Premium Shadow */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-gray-800 shadow-xl shadow-blue-500/5 hover:scale-[1.02] transition-transform duration-300">
                <img
                  src={bannerImg}
                  alt="Skill Development and Online Training Courses"
                  className="w-full h-auto object-cover block"
                />
              </div>

              {/* Background Glows */}
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
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
