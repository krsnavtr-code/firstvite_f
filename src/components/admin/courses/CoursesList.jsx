import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSearch, FaEdit, FaTrash, FaFilePdf, FaDownload, FaPaperPlane } from 'react-icons/fa';
import { getCourses, deleteCourse, getCategoriesForForm } from '../../../api/courseApi';
import api from '../../../api/axios';
import SendCoursePdfModal from './SendCoursePdfModal';

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHomeFilter, setShowHomeFilter] = useState('all'); // 'all', 'yes', 'no'
  const [generatingPdf, setGeneratingPdf] = useState(null);
  const [deletingPdf, setDeletingPdf] = useState(null);
  const [pdfUrls, setPdfUrls] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('pdfUrls');
    return saved ? JSON.parse(saved) : {};
  });
  const [coursesWithPdf, setCoursesWithPdf] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('coursesWithPdf');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showSendPdfModal, setShowSendPdfModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch courses and categories
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching categories...');
        const categoriesData = await getCategoriesForForm();
        console.log('Categories fetched:', categoriesData);
        setCategories(categoriesData);
        
        // Build query parameters
        const params = {
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
          showOnHome: showHomeFilter !== 'all' ? (showHomeFilter === 'yes' ? 'true' : 'false') : undefined,
          all: 'true' // Make sure to include all courses including unpublished ones for admin
        };
        
        // Remove undefined values
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        
        console.log('Fetching courses with params:', params);
        const response = await getCourses(new URLSearchParams(params).toString(), true);
        console.log('API Response:', response);
        
        // Handle different response formats
        let coursesData = [];
        if (Array.isArray(response)) {
          coursesData = response;
        } else if (response && Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (response && response.data && typeof response.data === 'object') {
          // If data is an object, convert it to array
          coursesData = Object.values(response.data);
        }
        
        console.log('Processed courses data:', coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(`Failed to load data: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        setCourses([]); // Set empty array to prevent render issues
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory, searchTerm, showHomeFilter]);

  // Save to localStorage whenever coursesWithPdf or pdfUrls change
  useEffect(() => {
    localStorage.setItem('coursesWithPdf', JSON.stringify(Array.from(coursesWithPdf)));
    localStorage.setItem('pdfUrls', JSON.stringify(pdfUrls));
  }, [coursesWithPdf, pdfUrls]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        setCourses(courses.filter(course => course._id !== id));
        toast.success('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };

  const handleGeneratePdf = async (course) => {
    try {
      setGeneratingPdf(course._id);
      
      // Generate and save PDF on the server
      const response = await api.post(
        `/courses/${course._id}/generate-pdf`
      );
      
      // Update state to show download button
      const newCoursesWithPdf = new Set([...coursesWithPdf, course._id]);
      const newPdfUrls = {
        ...pdfUrls,
        [course._id]: {
          url: response.data.fileUrl,
          filename: response.data.filename
        }
      };
      
      // Update both states at once to minimize re-renders
      setCoursesWithPdf(newCoursesWithPdf);
      setPdfUrls(newPdfUrls);
      
      toast.success('PDF generated successfully. You can now download it.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to generate PDF');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDeletePdf = async (course) => {
    if (!window.confirm('Are you sure you want to delete this PDF? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPdf(course._id);
      
      // Get the PDF URL from the stored URLs
      const pdfInfo = pdfUrls[course._id];
      if (!pdfInfo || !pdfInfo.url) {
        throw new Error('PDF URL not found');
      }
      
      // Call the API to delete the PDF with the file URL in the request body
      await api.delete(`/courses/${course._id}/pdf`, {
        data: { fileUrl: pdfInfo.url }
      });
      
      // Update the local state
      const newPdfUrls = { ...pdfUrls };
      delete newPdfUrls[course._id];
      
      const newCoursesWithPdf = new Set(coursesWithPdf);
      newCoursesWithPdf.delete(course._id);
      
      setPdfUrls(newPdfUrls);
      setCoursesWithPdf(newCoursesWithPdf);
      
      // Update localStorage
      localStorage.setItem('pdfUrls', JSON.stringify(newPdfUrls));
      localStorage.setItem('coursesWithPdf', JSON.stringify(Array.from(newCoursesWithPdf)));
      
      toast.success('PDF deleted successfully');
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to delete PDF');
    } finally {
      setDeletingPdf(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the courses in your account including their title,
            category, and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Course
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Show on Home Filter */}
          <div>
            <label
              htmlFor="show-home-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Show on Home
            </label>
            <select
              id="show-home-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={showHomeFilter}
              onChange={(e) => setShowHomeFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              <option value="yes">Show on Home</option>
              <option value="no">Not on Home</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Category
                    </th>
                    {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Instructor
                    </th> */}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Home
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {courses.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No courses found. Create your first course to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            {course.image && (
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={course.image}
                                  alt={course.title}
                                />
                              </div>
                            )}
                            <div className={`${course.image ? "ml-4" : ""}`}>
                              <div className="font-medium text-gray-900">
                                {course.title}
                              </div>
                              <div className="text-gray-500">
                                {course.level}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {course.category?.name || "Uncategorized"}
                        </td>
                        {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {course.instructor}
                        </td> */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ₹ {course.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              course.showOnHome
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {course.showOnHome ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              course.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/admin/courses/${course._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Course"
                            >
                              <FaEdit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Course"
                            >
                              <FaTrash className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowSendPdfModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Send PDF to Student"
                            >
                              <FaPaperPlane className="w-5 h-5" />
                            </button>
                            {pdfUrls[course._id] ? (
                              <button
                                onClick={() => handleDeletePdf(course)}
                                className="p-2 rounded-md text-red-600 hover:bg-gray-100"
                                title="Delete PDF"
                                disabled={deletingPdf === course._id}
                              >
                                {deletingPdf === course._id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <FaTrash className="h-5 w-5" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGeneratePdf(course)}
                                disabled={generatingPdf === course._id}
                                className={`p-2 rounded-md ${
                                  generatingPdf === course._id
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                title="Generate PDF"
                              >
                                {generatingPdf === course._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                                ) : (
                                  <FaFilePdf className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Send PDF Modal */}
      {selectedCourse && (
        <SendCoursePdfModal
          course={selectedCourse}
          isOpen={showSendPdfModal}
          onClose={() => {
            setShowSendPdfModal(false);
            setSelectedCourse(null);
          }}
          onSuccess={() => {
            // Refresh courses list or show success message
            fetchCourses();
          }}
        />
      )}
    </div>
  );
};

export default CoursesList;
