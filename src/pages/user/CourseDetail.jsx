import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById } from '../../api/courseApi';
import { toast } from 'react-hot-toast';
import { FaStar, FaUsers, FaClock, FaPlay, FaDownload, FaShare, FaBook, FaCertificate, FaMoneyBillWave, FaGlobe } from 'react-icons/fa';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseById(id);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link 
            to="/courses" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Course Header */}
      <div className="bg-white dark:bg-slate-800 shadow">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li>
                <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                    Courses
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-500">/</span>
                  <span className="text-gray-500">{course.title}</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-4 dark:text-white">{course.title}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{course.shortDescription || course.description?.substring(0, 200)}...</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-yellow-400">
                  <FaStar className="mr-1" />
                  <span className="text-gray-700 dark:text-gray-300 ml-1">
                    {course.rating?.toFixed(1) || 'New'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaUsers className="mr-1" />
                  <span>{course.enrolledStudents || 0} students</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaClock className="mr-1" />
                  <span>{course.duration || 'Self-paced'}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center">
                  <FaPlay className="mr-2" /> Enroll Now
                </button>
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium flex items-center">
                  <FaShare className="mr-2" /> Share
                </button>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6">
                <div className="relative pb-9/16 mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/course-placeholder.jpg";
                    }}
                  />
                  {course.isFeatured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                    {course.originalPrice > course.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ${course.originalPrice}
                      </span>
                    )}
                  </span>
                  {course.discount && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {course.discount}% OFF
                    </span>
                  )}
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium mb-4">
                  Add to Cart
                </button>
                
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <FaBook className="mr-2" />
                    <span>{course.lessons?.length || 0} Lessons</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <FaGlobe className="mr-2" />
                    <span>English</span>
                  </div>
                  <div className="flex items-center">
                    <FaCertificate className="mr-2" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'curriculum'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'instructor'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === 'overview' && (
            <div className="prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="mb-6">{course.description}</p>
              
              <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {course.whatYouWillLearn?.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </div>
                )) || (
                  <p>No learning objectives specified.</p>
                )}
              </div>
              
              <h3 className="text-xl font-semibold mb-4">Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 mb-8">
                {course.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                )) || (
                  <li>No specific requirements</li>
                )}
              </ul>
              
              <h3 className="text-xl font-semibold mb-4">Who is this course for?</h3>
              <ul className="list-disc pl-5 space-y-2">
                {course.whoIsThisFor?.map((item, index) => (
                  <li key={index}>{item}</li>
                )) || (
                  <li>Anyone interested in learning about this topic</li>
                )}
              </ul>
            </div>
          )}
          
          {activeTab === 'curriculum' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Course Content</h2>
              {course.curriculum?.length > 0 ? (
                <div className="space-y-4">
                  {course.curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 font-medium flex justify-between items-center cursor-pointer">
                        <div className="flex items-center">
                          <span className="mr-2">{section.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {section.lessons?.length || 0} lessons • {section.duration || '0 min'}
                          </span>
                        </div>
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="bg-white dark:bg-slate-800">
                        {section.lessons?.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center">
                              <FaPlay className="h-4 w-4 text-gray-400 mr-3" />
                              <span>{lesson.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">{lesson.duration || '5:00'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No curriculum available for this course yet.</p>
              )}
            </div>
          )}
          
          {activeTab === 'instructor' && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <div className="flex flex-col items-center">
                    <img 
                      src={course.instructor?.avatar || '/images/avatar-placeholder.png'} 
                      alt={course.instructor?.name || 'Instructor'} 
                      className="h-24 w-24 rounded-full mb-4 object-cover"
                    />
                    <h3 className="text-xl font-bold">{course.instructor?.name || 'Instructor Name'}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{course.instructor?.title || 'Course Instructor'}</p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-blue-500">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-blue-700">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Total Students</h4>
                      <p className="text-gray-600 dark:text-gray-300">10,000+</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Courses</h4>
                      <p className="text-gray-600 dark:text-gray-300">15+</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Reviews</h4>
                      <p className="text-gray-600 dark:text-gray-300">4,500+</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-3/4">
                <h3 className="text-2xl font-bold mb-4">About the Instructor</h3>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="mb-4">
                    {course.instructor?.bio || 'No biography available for this instructor.'}
                  </p>
                  <p>
                    With years of experience in the field, our instructor is dedicated to providing high-quality education 
                    and helping students achieve their learning goals. Their teaching approach focuses on practical, 
                    real-world applications to ensure you gain the skills you need to succeed.
                  </p>
                </div>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Other Courses by This Instructor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="h-40 bg-gray-200 dark:bg-slate-700"></div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Course Title {item}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                          Brief description of the course content and what students will learn.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">View Course</span>
                          <span className="text-sm text-gray-500">${(item * 20) + 29}.99</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Student Feedback</h2>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(course.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      {course.rating?.toFixed(1) || 'No'} rating • {course.reviews?.length || 0} reviews
                    </span>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                  Write a Review
                </button>
              </div>
              
              {course.reviews?.length > 0 ? (
                <div className="space-y-6">
                  {course.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium mr-4">
                          {review.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {review.user?.name || 'Anonymous User'}
                              </h4>
                              <div className="flex items-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-2 text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this course!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Related Courses */}
      <div className="bg-gray-50 dark:bg-slate-800 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 dark:text-white">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-40 bg-gray-200 dark:bg-slate-600"></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14 dark:text-white">
                    Related Course Title {item}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="flex items-center mr-4">
                      <FaStar className="text-yellow-400 mr-1" />
                      {Math.round(Math.random() * 2 + 3).toFixed(1)}
                    </span>
                    <span className="flex items-center">
                      <FaUsers className="mr-1" />
                      {Math.floor(Math.random() * 1000)} students
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${(item * 20) + 29}.99
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
