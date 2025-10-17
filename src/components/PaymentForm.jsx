import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { createPortal } from "react-dom";
import { loadRazorpay, initRazorpayPayment } from "../utils/razorpay";

const PaymentForm = ({ onClose, initialData = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.state?.userType || "student";
  const {
    isCompanyRegistration,
    amount: companyAmount,
    description,
  } = location.state || {};

  const [formData, setFormData] = useState(() => {
    const data = initialData || {};
    return {
      name: data.name || "",
      email: data.email || "",
      countryCode: data.countryCode || "+91",
      phone: data.phone ? data.phone.replace(/^\+91/, "") : "",
      course: data.course || "",
      coursePrice: data.amount ? String(Number(data.amount) * 1.18) : "",
      paymentAmount: data.amount ? String(Number(data.amount) * 1.18) : "",
      terms: false,
    };
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
    const cachedCourses = sessionStorage.getItem("cachedCourses");
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
        console.time("FetchCourses");

        // Fetch all published courses with a high limit
        const response = await api.get(
          `/courses?isPublished=true&limit=100&page=1&all=true&fields=title,price`,
          {
            timeout: 15000, // Increased timeout for larger payload
          }
        );

        // console.log("Courses API response:", response);

        // console.timeEnd("FetchCourses");
        // console.log("API Response:", response);

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
          console.warn("No courses found in the response");
          toast.error("No courses available at the moment");
          return;
        }

        // console.log("Courses data received:", coursesData); // Debug log
        // console.log("Total courses received:", coursesData.length); // Debug log

        // Cache the courses in sessionStorage
        sessionStorage.setItem("cachedCourses", JSON.stringify(coursesData));
        sessionStorage.setItem("coursesLastFetched", Date.now().toString());

        setCourses((prevCourses) => {
          // Create a map to avoid duplicates
          const courseMap = new Map(
            prevCourses.map((course) => [course._id, course])
          );
          // Add or update courses
          coursesData.forEach((course) => courseMap.set(course._id, course));
          return Array.from(courseMap.values());
        });

        setHasMoreCourses(false); // No more pages to load since we're fetching all at once
      } catch (error) {
        console.error("Error fetching courses:", error);
        let errorMessage = "Failed to load courses";

        if (error.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. Please check your connection and try again.";
        } else if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          errorMessage = `Server error: ${error.response.status}`;
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          errorMessage = "No response from server. Please try again later.";
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
      description: isCompanyRegistration
        ? "JobFair Registration Fee"
        : `Payment for ${formData.course}`,
      order_id: orderData.id,
      handler: async function (response) {
        try {
          const paymentData = {
            orderId: orderData.id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            name: formData.name,
            email: formData.email,
            phone: formData.countryCode + formData.phone,
            course: isCompanyRegistration
              ? "JobFair Registration"
              : formData.course,
            paymentAmount: isCompanyRegistration
              ? companyAmount
              : parseFloat(formData.paymentAmount),
            address: "Not provided",
            userId: localStorage.getItem("userId") || null,
            isCompanyRegistration: isCompanyRegistration || false,
          };

          // Verify payment on the server
          const verifyResponse = await api.post(
            "/payments/verify",
            paymentData
          );

          if (verifyResponse.data.success) {
            toast.success("Payment successful!");

            if (isCompanyRegistration) {
              // Clear the company registration data from session
              sessionStorage.removeItem("companyRegistration");
              // Navigate to success page for company registration
              navigate("/", {
                state: {
                  message:
                    "Your company registration and payment are complete!",
                  isCompanyRegistration: true,
                },
              });
            } else {
              onClose?.();
            }

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
            throw new Error(
              verifyResponse.data.message || "Payment verification failed"
            );
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Error verifying payment. Please contact support.";
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

    // Check if this is a company registration payment
    const requiredFields = isCompanyRegistration
      ? ["name", "email", "countryCode", "phone", "terms"]
      : [
          "name",
          "email",
          "countryCode",
          "phone",
          "course",
          "paymentAmount",
          "terms",
        ];

    // Validate required fields
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in all required fields`);
        return;
      }
    }

    // Validate payment amount for non-company payments
    if (
      !isCompanyRegistration &&
      (isNaN(formData.paymentAmount) || parseFloat(formData.paymentAmount) <= 0)
    ) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // For company registration, use the predefined amount
      const amount = isCompanyRegistration
        ? Math.round(companyAmount * 100) // Convert to paise
        : parseFloat(formData.paymentAmount) * 100;

      // Create a Razorpay order
      const response = await api.post("/payments/create-order", {
        amount: amount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          course: isCompanyRegistration
            ? "JobFair Registration"
            : formData.course,
          name: formData.name,
          email: formData.email,
          isCompanyRegistration: isCompanyRegistration || false,
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

  useEffect(() => {
    // Only load from session storage if we don't have initialData
    if (isCompanyRegistration && !initialData?.email) {
      const companyData = sessionStorage.getItem("companyRegistration");
      if (companyData) {
        const { name, email, phone } = JSON.parse(companyData);
        setFormData((prev) => ({
          ...prev,
          name,
          email,
          phone: phone.replace(/^\+91/, ""), // Remove country code if present
          countryCode: phone.startsWith("+") ? phone.match(/^\+\d+/)[0] : "+91",
          course: "JobFair Registration",
          paymentAmount: (companyAmount * 1.18).toString(), // Add 18% GST
          coursePrice: (companyAmount * 1.18).toString(), // Add 18% GST
        }));
      }
    }
  }, [isCompanyRegistration, companyAmount, initialData]);

  return createPortal(
    <div className="z-[99999] fixed inset-0 bg-transparent flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {initialData?.isJobFair
                ? "Make Payment to book JobFair slot"
                : "Make a Payment"}
            </h2>
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-700"
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
                readOnly={initialData?.isJobFair}
                className={`p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  initialData?.isJobFair
                    ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                    : "bg-gray-700 text-white"
                } border-gray-800 text-black`}
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
                readOnly={initialData?.isJobFair}
                className={`p-2 block w-full text-white bg-gray-700 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border-gray-800 text-black ${
                  initialData?.isJobFair
                    ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                    : "bg-gray-700 text-white"
                }`}
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
                    disabled={initialData?.isJobFair}
                    className={`flex-shrink-0 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-l-md border border-r-0 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 h-10 px-2 bg-gray-50 border-gray-800 text-black ${
                      initialData?.isJobFair
                        ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                        : "bg-gray-700 text-white"
                    }`}
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
                    readOnly={initialData?.isJobFair}
                    className={`flex-1 min-w-0 block w-full px-3 py-1 rounded-none bg-gray-700 rounded-r-md border border-l-0 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 border-gray-800 text-white ${
                      initialData?.isJobFair
                        ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                        : "bg-gray-700 text-white"
                    }`}
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
                Program Name
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
                    disabled={initialData?.isJobFair}
                    className={`p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                      initialData?.isJobFair
                        ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                        : "bg-gray-700 text-white"
                    }`}
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
                Amount to Pay (₹)
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
                readOnly={initialData?.isJobFair}
                className={`p-2 block w-full text-white bg-gray-700 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 border-gray-800 text-black ${
                  initialData?.isJobFair
                    ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                    : "bg-gray-700 text-white"
                }`}
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
                className="flex justify-center py-1 px-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black bg-gray-50 border-gray-800 text-black"
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
    </div>,
    document.body
  );
};

export default PaymentForm;
