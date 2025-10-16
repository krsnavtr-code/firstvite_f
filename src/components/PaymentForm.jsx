import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { loadRazorpay, initRazorpayPayment } from "../utils/razorpay";

const PaymentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    course: "",
    coursePrice: "",
    paymentAmount: "",
    terms: false,
  });

  const countryCodes = [
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+1", flag: "🇺🇸", name: "USA" },
    { code: "+44", flag: "🇬🇧", name: "UK" },
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+65", flag: "🇸🇬", name: "Singapore" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+86", flag: "🇨🇳", name: "China" },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [courses, setCourses] = useState(() => {
    // Try to load from sessionStorage on initial render
    const cachedCourses = sessionStorage.getItem('cachedCourses');
    return cachedCourses ? JSON.parse(cachedCourses) : [];
  });
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [hasMoreCourses, setHasMoreCourses] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load Razorpay script and courses when component mounts
  useEffect(() => {
    // Load Razorpay
    loadRazorpay().then((success) => {
      if (!success) {
        toast.error("Failed to load payment gateway. Please try again later.");
      }
      setIsRazorpayLoaded(success);
    });

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        console.time('FetchCourses');
        
        // Fetch all published courses with a high limit
        const response = await api.get(`/courses?isPublished=true&limit=100&page=1&all=true&fields=title,price`, {
          timeout: 15000, // Increased timeout for larger payload
        });
        
        console.log('Courses API response:', response);
        
        console.timeEnd('FetchCourses');
        console.log('API Response:', response);
        
        let coursesData = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          coursesData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          coursesData = response.data.data;
        } else if (Array.isArray(response.data?.courses)) {
          coursesData = response.data.courses;
        }
        
        if (coursesData.length === 0) {
          console.warn('No courses found in the response');
          toast.error('No courses available at the moment');
          return;
        }
        
        console.log('Courses data received:', coursesData); // Debug log
        console.log('Total courses received:', coursesData.length); // Debug log
        
        // Cache the courses in sessionStorage
        sessionStorage.setItem('cachedCourses', JSON.stringify(coursesData));
        sessionStorage.setItem('coursesLastFetched', Date.now().toString());
        
        setCourses(prevCourses => {
          // Create a map to avoid duplicates
          const courseMap = new Map(prevCourses.map(course => [course._id, course]));
          // Add or update courses
          coursesData.forEach(course => courseMap.set(course._id, course));
          return Array.from(courseMap.values());
        });
        
        setHasMoreCourses(false); // No more pages to load since we're fetching all at once
      } catch (error) {
        console.error("Error fetching courses:", error);
        let errorMessage = 'Failed to load courses';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.response) {
          // The request was made and the server responded with a status code
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          errorMessage = `Server error: ${error.response.status}`;
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          errorMessage = 'No response from server. Please try again later.';
        }
        
        toast.error(errorMessage);
      } finally {
        setLoadingCourses(false);
      }
    };

    // Always refresh courses on initial load
    fetchCourses();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [coursePage]);

  // const handleCourseChange = (e) => {
  //   const selectedCourseTitle = e.target.value;
  //   const selectedCourse = courses.find(
  //     (course) => course.title === selectedCourseTitle
  //   );

  //   setFormData((prev) => ({
  //     ...prev,
  //     course: selectedCourseTitle,
  //     coursePrice: selectedCourse?.price || "",
  //     paymentAmount: selectedCourse?.price || "",
  //   }));
  // };

  const handleCourseChange = (e) => {
    const selectedCourseTitle = e.target.value;

    if (selectedCourseTitle === "JobFair Registration") {
      const basePrice = 4000;
      const gstAmount = Math.round(basePrice * 0.18);
      const totalPrice = basePrice + gstAmount;

      setFormData((prev) => ({
        ...prev,
        course: selectedCourseTitle,
        coursePrice: totalPrice,
        paymentAmount: totalPrice,
      }));
      return;
    }
    const selectedCourse = courses.find(
      (course) => course.title === selectedCourseTitle
    );
    setFormData((prev) => ({
      ...prev,
      course: selectedCourseTitle,
      coursePrice: selectedCourse?.price || "",
      paymentAmount: selectedCourse?.price || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const initiateRazorpayPayment = async (orderData) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "FirstVITE",
      description: `Payment for ${formData.course}`,
      order_id: orderData.id,
      handler: async function (response) {
        try {
          // Prepare payment data with all required fields
          const paymentData = {
            orderId: orderData.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            name: formData.name,
            email: formData.email,
            phone: formData.countryCode + formData.phone,
            course: formData.course,
            paymentAmount: parseFloat(formData.paymentAmount),
            address: "Not provided", // Default value for address
            userId: localStorage.getItem('userId') || null // Get userId from localStorage if available
          };

          // Verify payment on the server
          const verifyResponse = await api.post("/payments/verify", paymentData);

          if (verifyResponse.data.success) {
            toast.success("Payment successful!");
            onClose();
            // Reset form
            setFormData({
              name: "",
              email: "",
              countryCode: "+91",
              phone: "",
              course: "",
              paymentAmount: "",
              terms: false,
            });
          } else {
            toast.error(verifyResponse.data.message || "Payment verification failed. Please contact support.");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          const errorMessage = error.response?.data?.message || "Error verifying payment. Please contact support.";
          toast.error(errorMessage);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.countryCode + formData.phone,
      },
      theme: {
        color: "#4F46E5",
      },
    };

    const paymentObject = initRazorpayPayment(options);
    if (!paymentObject) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    paymentObject.on("payment.failed", function (response) {
      toast.error(`Payment failed: ${response.error.description}`);
    });
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.countryCode ||
      !formData.phone ||
      !formData.course ||
      !formData.paymentAmount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      isNaN(formData.paymentAmount) ||
      parseFloat(formData.paymentAmount) <= 0
    ) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a Razorpay order
      const response = await api.post("/payments/create-order", {
        amount: parseFloat(formData.paymentAmount) * 100, // Convert to paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          course: formData.course,
          name: formData.name,
          email: formData.email,
        },
      });

      if (response.data.success) {
        await initiateRazorpayPayment(response.data.order);
      } else {
        throw new Error(
          response.data.message || "Failed to create payment order"
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to process payment";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="z-[9999] fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Make a Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-black"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-2 block w-full text-white bg-gray-700 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border-gray-800 text-black"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="p-2 block w-full text-white bg-gray-700 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border-gray-800 text-black"
                required
              />
            </div>

            <div>
              <div className="space-y-1">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-black"
                >
                  Phone Number
                </label>
                <div className="flex rounded-md shadow-sm">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-l-md border border-r-0 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 h-10 px-2 bg-gray-50 border-gray-800 text-black"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                      if (value.length <= 10) {
                        // Increased limit for international numbers
                        handleChange({
                          target: {
                            name: "phone",
                            value: value,
                          },
                        });
                      }
                    }}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    maxLength={10}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none bg-gray-700 rounded-r-md border border-l-0 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 border-gray-800 text-black"
                    required
                  />
                </div>
                <p className="text-xs text-black mt-1">
                  Full number: {formData.countryCode} {formData.phone}
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-black"
              >
                Course Name
              </label>
              {loadingCourses ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
              ) : (
                <>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleCourseChange}
                    className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white bg-gray-700 bg-gray-50 border-gray-800 text-black"
                    required
                  >
                    <option value="">Select a course</option>
                    <option value="JobFair Registration">
                      JobFair Registration (₹4,000 + GST)
                    </option>
                    {[...courses]
                      .sort((a, b) =>
                        a.title.localeCompare(b.title, "en", {
                          sensitivity: "base",
                        })
                      )
                      .map((course) => (
                        <option key={course._id} value={course.title}>
                          {course.title}
                        </option>
                      ))}
                  </select>
                  {formData.coursePrice && (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      Price: ₹{formData.coursePrice}
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <label
                htmlFor="paymentAmount"
                className="block text-sm font-medium text-black"
              >
                Payment Amount (₹)
              </label>
              <input
                type="number"
                id="paymentAmount"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter amount"
                className="p-2 block w-full text-white bg-gray-700 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border-gray-800 text-black"
                required
              />
            </div>

            <div className="flex items-center space-x-1">
              {/* Checkbox for terms and conditions */}
              <input
                type="checkbox"
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border-gray-800 text-black"
                required
              />
              <label
                htmlFor="terms"
                className="block text-sm font-medium text-black"
              >
                I accept the payment <Link to="/payment-t-and-c">T&C</Link>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex justify-center py-1 px-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black bg-gray-50 border-gray-800 text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isRazorpayLoaded}
                className="flex justify-center py-1 px-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
