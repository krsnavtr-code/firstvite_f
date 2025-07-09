import React, { useState } from "react";
import { FaSearch, FaBookOpen, FaUsers, FaCertificate, FaPlay, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import bannerImg from "../../public/Banner.png";

function Banner() {
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      icon: <FaBookOpen className="text-2xl text-blue-500 dark:text-blue-400" />,
      title: "1000+ Courses",
      desc: "Wide range of topics"
    },
    {
      icon: <FaUsers className="text-2xl text-green-500 dark:text-green-400" />,
      title: "Expert Instructors",
      desc: "Learn from the best"
    },
    {
      icon: <FaCertificate className="text-2xl text-yellow-500 dark:text-yellow-400" />,
      title: "Certification",
      desc: "Get certified"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 mt-16 dark:from-gray-900 dark:to-gray-800 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Unlock Your <span className="text-blue-600 dark:text-blue-400">Potential</span> with
              <br />
              <span className="text-blue-600 dark:text-blue-400">Online Learning</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover the easiest way to learn new skills and advance your career with our comprehensive online courses. 
              Join thousands of students already learning with us.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 text-base transition-colors duration-200"
                placeholder="What do you want to learn today?"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Link
                  to={`/courses?search=${encodeURIComponent(searchQuery)}`}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition duration-200 flex items-center"
                >
                  <FaSearch className="mr-2" /> Search
                </Link>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
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
              <div className="relative z-10">
                <img
                  src={bannerImg}
                  alt="Online Learning"
                  className="w-full h-auto max-w-2xl mx-auto rounded-lg shadow-xl dark:shadow-gray-900/50 transition-transform duration-500 hover:scale-105"
                />
              </div>
              {/* Floating elements */}
              {/* <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <FaUsers className="text-green-500 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">10,000+</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
                  </div>
                </div>
              </div> */}
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 right-20 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
