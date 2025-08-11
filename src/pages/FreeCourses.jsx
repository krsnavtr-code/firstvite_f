import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import axios from 'axios';
import { FaSearch, FaStar, FaClock, FaUser, FaBook } from 'react-icons/fa';

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    const fetchCategoryCourses = async () => {
      try {
        setLoading(true);
        const categoryId = '68887f978b23a2d739ac5be4'; // The specified category ID
        console.log(`Fetching courses for category: ${categoryId}`);
        
        // Fetch all published courses from the specified category
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/courses?category=${categoryId}&isPublished=true`
        );
        
        console.log('Category courses response:', response.data);
        
        const coursesData = Array.isArray(response.data) ? response.data : [];
        console.log(`Found ${coursesData.length} courses in this category`);
        
        // Sort courses: free ones first, then paid ones
        const sortedCourses = [...coursesData].sort((a, b) => {
          // If one is free and the other isn't, free comes first
          if ((a.price === 0 || a.isFree) && (b.price > 0 && !b.isFree)) return -1;
          if ((b.price === 0 || b.isFree) && (a.price > 0 && !a.isFree)) return 1;
          
          // If both are free or both are paid, sort by title
          return a.title.localeCompare(b.title);
        });
        
        setCourses(sortedCourses);
        setFilteredCourses(sortedCourses);
        
      } catch (error) {
        console.error('Error fetching category courses:', error);
        console.error('Error details:', error.response?.data || error.message);
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.instructor && course.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (course.category && course.category.name && course.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Free Online Courses | Learn New Skills for Free | FirstVITE"
        description="Access high-quality free courses on FirstVITE. Learn in-demand skills with our free online courses taught by industry experts. Start learning today!"
        keywords="free courses, online learning, free online courses, learn new skills, free education, online courses, free certification, skill development"
        og={{
          title: 'Free Online Courses | Learn New Skills for Free | FirstVITE',
          description: 'Start learning today with our collection of free online courses. No hidden fees, no credit card required. Enhance your skills at no cost!',
          type: 'website'
        }}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Free Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Start learning today with our free courses
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search free courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/course/${course._id}`}>
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaBook className="text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      FREE
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {course.shortDescription || "No description available"}
                    </p>
                    {/* <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <FaUser className="mr-1" />
                      <span>{course.instructor || "Instructor"}</span>
                    </div> */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-yellow-400">
                        <FaStar className="mr-1" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {course.rating?.toFixed(1) || "New"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <FaClock className="mr-1" />
                        <span>{course.duration || "0h 0m"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No free courses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Check back later for new free courses!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FreeCourses;
