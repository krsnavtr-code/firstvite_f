import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import { getCourses, deleteCourse } from "../../api/courseApi";
import userApi from "../../api/userApi";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  console.log("AdminDashboard - Rendering...");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(id);
        // Refresh the courses list after deletion
        const response = await getCourses();
        setCourses(response.data || []);
        toast.success("Course deleted successfully");
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error("Failed to delete course");
      }
    }
  };

  useEffect(() => {
    console.log("AdminDashboard - useEffect running");
    const fetchData = async () => {
      console.log("Fetching dashboard data...");
      try {
        setLoading(true);

        // Fetch categories
        try {
          const categoriesRes = await getCategories();
          console.log("Categories response:", categoriesRes);
          const categoriesData = categoriesRes.data || categoriesRes || [];
          setCategories(categoriesData);
          console.log("Processed categories:", categoriesData);
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast.error("Failed to load categories");
        }

        // Fetch courses
        try {
          const coursesRes = await getCourses();
          console.log("Courses response:", coursesRes);
          const coursesData = coursesRes.data || coursesRes || [];
          setCourses(coursesData);
          console.log("Processed courses:", coursesData);
        } catch (error) {
          console.error("Error fetching courses:", error);
          toast.error("Failed to load courses");
        }

        // Fetch users
        try {
          const usersRes = await userApi.getUsers();
          console.log("Users response:", usersRes);
          const usersData = usersRes.data || usersRes || [];
          setUsers(usersData);
          console.log("Processed users:", usersData);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log("AdminDashboard - Render with state:", { loading, categories });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Categories Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/admin/categories")}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
              <p className="text-2xl font-semibold text-gray-800">
                {Array.isArray(categories) ? categories.length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Students Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/admin/students")}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0111.357-3.182M15 21v-1a4 4 0 00-4-4H8m11-9a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Students
              </h3>
              <p className="text-2xl font-semibold text-gray-800">
                {Array.isArray(users) ? users.length : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Courses Card */}
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate("/admin/courses")}
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Courses
              </h3>
              <p className="text-2xl font-semibold text-gray-800">
                {courses.length}
              </p>
            </div>
          </div>
        </div>

        {/* Published Courses Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Published</h3>
              <p className="text-2xl font-semibold text-gray-800">
                {courses.filter((course) => course.isPublished).length}
              </p>
            </div>
          </div>
        </div>

        {/* Total Students Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Students
              </h3>
              <p className="text-2xl font-semibold text-gray-800">1,234</p>
            </div>
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
              <p className="text-2xl font-semibold text-gray-800">
                <Link to="/admin/categories" className="hover:text-indigo-600">
                  Manage
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm font-medium">
                Total Revenue
              </h3>
              <p className="text-2xl font-semibold text-gray-800">₹ 12,345</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <Link
            to="/admin/activity"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  New course{" "}
                  <span className="font-medium">"Advanced React"</span> was
                  added
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/courses/new"
              className="flex items-center p-3 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Course
            </Link>
            <Link
              to="/admin/categories/new"
              className="flex items-center p-3 rounded-md bg-green-50 text-green-700 hover:bg-green-100"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Category
            </Link>
            <Link
              to="/admin/users/new"
              className="flex items-center p-3 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add New User
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Server Load</span>
                <span className="font-medium">24%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "24%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Last Backup</span>
                <span className="text-gray-600">2 hours ago</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Version</span>
                <span className="text-gray-600">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Courses</h3>
          <Link
            to="/admin/courses"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No courses found. Create your first course to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.slice(0, 5).map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {course.image && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={course.image}
                              alt={course.title}
                            />
                          </div>
                        )}
                        <div className={`${course.image ? "ml-4" : ""}`}>
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.instructor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${course.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/courses/edit/${course._id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
