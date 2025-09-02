import React, { useState, useEffect } from "react";
import SEO from "../components/SEO";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { submitContactForm } from "../api/contactApi";
import { getCourses } from "../api/courseApi";
import { Link } from "react-router-dom";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    courseInterest: "", // Changed from array to single value
    courseInterests: [], // Keeping for backward compatibility
    agreedToTerms: false,
  });

  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("Fetching courses...");
        const response = await getCourses("", false); // Empty string for category to get all courses, false for published only
        console.log("Courses API response:", response);

        // Check different possible response structures
        let coursesData = [];

        if (Array.isArray(response)) {
          // If response is directly an array
          coursesData = response;
        } else if (response && Array.isArray(response.data)) {
          // If response has a data property that's an array
          coursesData = response.data;
        } else if (
          response &&
          response.success &&
          Array.isArray(response.data)
        ) {
          // If response has success and data properties
          coursesData = response.data;
        }

        if (coursesData.length > 0) {
          // Map the API response to match the expected format
          const formattedCourses = coursesData.map((course) => ({
            id: course._id || course.id,
            name: course.title || course.name || "Untitled Course",
          }));

          console.log("Formatted courses:", formattedCourses);
          setCourses(formattedCourses);
        } else {
          console.warn("No courses found in the response");
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error(
          "Failed to load course options. " +
            (error.response?.data?.message || "")
        );
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Keeping handleCheckboxChange for backward compatibility
  const handleCheckboxChange = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courseInterest: courseId,
      courseInterests: [courseId], // Maintain compatibility with existing code
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreedToTerms) {
      toast.error("Please accept the terms & conditions and privacy policy", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm(formData);
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        courseInterests: [],
        agreedToTerms: false,
      });

      toast.success("Your message has been sent successfully!", {
        position: "top-center",
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title="Contact Us | FirstVITE - Get in Touch"
        description="Have questions? Contact the FirstVITE team today. We're here to help with any inquiries about our courses, enrollment process, or technical support."
        keywords="contact FirstVITE, support, help, inquiry, course information, customer service, email, phone, address"
        og={{
          title: "Contact FirstVITE - We're Here to Help",
          description:
            "Get in touch with our team for any questions about our courses, enrollment, or support. We look forward to hearing from you!",
          type: "website",
        }}
      />
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
              Contact Us
            </h1>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-black dark:text-white max-w-3xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Fill out
              the form below or reach out to us directly.
            </p>
          </div>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-black dark:text-white max-w-3xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Fill out the
            form below or reach out to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <FaMapMarkerAlt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">
                      Address
                    </h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      H-161 BSI Sector-63 Noida Gautam Budh Nagar <br /> Uttar
                      Pradesh 201301
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <FaPhone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">
                      Phone
                    </h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      +91 9990056799
                      <br />
                      Mon - Fri, 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <FaEnvelope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">
                      Email
                    </h3>
                    <p className="mt-1 text-black dark:text-white">
                      info@firstvite.com
                      <br />
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                Follow Us
              </h2>
              <div className="flex space-x-4">
                {[
                  {
                    name: "Facebook",
                    icon: FaFacebook,
                    color: "text-blue-600",
                  },
                  { name: "Twitter", icon: FaTwitter, color: "text-blue-400" },
                  {
                    name: "Instagram",
                    icon: FaInstagram,
                    color: "text-pink-500",
                  },
                  {
                    name: "LinkedIn",
                    icon: FaLinkedin,
                    color: "text-blue-700",
                  },
                ].map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={`#${social.name.toLowerCase()}`}
                      className={`${social.color} hover:opacity-80 transition-opacity`}
                      aria-label={social.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sr-only">{social.name}</span>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
              Send us a Message
            </h2>

            {isSuccess ? (
              <div className="text-center py-12">
                <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-black dark:text-white mb-6">
                  Thank you for contacting us. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-black dark:text-white mb-1"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-black dark:text-white mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+91 8080808080"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="courseInterest"
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    I'm interested in: (Optional)
                  </label>
                  {isLoadingCourses ? (
                    <div className="relative">
                      <select
                        id="courseInterest"
                        name="courseInterest"
                        disabled
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <option>Loading courses...</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    </div>
                  ) : courses.length > 0 ? (
                    <div className="mt-1">
                      <select
                        id="courseInterest"
                        name="courseInterest"
                        value={formData.courseInterest}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            courseInterest: e.target.value,
                          }))
                        }
                        className="w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select a course (optional)</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <select
                      id="courseInterest"
                      name="courseInterest"
                      disabled
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                      <option>No courses available</option>
                    </select>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-black dark:text-white mb-1"
                  >
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={2}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreedToTerms"
                        name="agreedToTerms"
                        type="checkbox"
                        checked={formData.agreedToTerms}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            agreedToTerms: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agreedToTerms"
                        className="font-medium text-black dark:text-white"
                      >
                        I hereby agree to receive the promotional emails &
                        messages through WhatApp/RCS/SMS{" "}
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
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-25 flex justify-center self-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    } mt-4`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
