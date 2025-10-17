import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import PaymentForm from "../components/PaymentForm";
import _ from "lodash";

const CandidateInviteForm = ({ defaultType = "student" }) => {
  const [userType, setUserType] = useState(defaultType);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userType: userType,
    course: "",
    college: "",
    university: "",
    companyName: "",
    profilePhoto: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [showPendingPaymentModal, setShowPendingPaymentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [formLink, setFormLink] = useState("");
  const [companyFormData, setCompanyFormData] = useState(null);

  // Check if phone exists in the database
  const checkPhoneExists = async (phone) => {
    if (!phone) {
      setPhoneExists(false);
      return false;
    }

    // First, check for pending payments
    if (formData.email && formData.email.includes("@") && phone.length >= 10) {
      try {
        const response = await axios.get(
          "/api/candidates/check-company-payment",
          { params: { email: formData.email, phone } }
        );

        if (response.data.exists) {
          if (response.data.userType === "company") {
            setFormData((prev) => ({
              ...prev,
              isPaymentDone: response.data.isPaymentDone,
            }));

            if (!response.data.isPaymentDone) {
              setShowPendingPaymentModal(true);
              setPhoneExists(true);
              return true;
            }

            setPhoneExists(true);
            return true;
          }
        }
      } catch (error) {
        console.error("Error checking company payment status:", error);
      }
    }

    // Then proceed with normal phone existence check
    try {
      setIsCheckingPhone(true);
      const response = await axios.get(
        `/api/candidates/check-phone?phone=${phone}`
      );
      setPhoneExists(response.data.exists);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking phone:", error);
      return false;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Create debounced version of checkPhoneExists
  const debouncedCheckPhone = useRef(
    _.debounce(async (phone) => checkPhoneExists(phone))
  ).current;

  // Cleanup debounce on component unmount
  useEffect(() => {
    return () => {
      debouncedCheckPhone.cancel();
    };
  }, [debouncedCheckPhone]);

  // Check if email exists in the database
  const checkEmailExists = async (email) => {
    if (!email) {
      setEmailExists(false);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailExists(false);
      return false;
    }

    try {
      setIsCheckingEmail(true);
      const response = await axios.get(
        `/api/candidates/check-email?email=${encodeURIComponent(email)}`
      );
      setEmailExists(response.data.exists);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounced version of checkEmailExists
  const debouncedCheckEmail = useRef(
    _.debounce((email) => checkEmailExists(email), 500)
  ).current;

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedCheckEmail.cancel();
    };
  }, [debouncedCheckEmail]);

  // Clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const baseUrl = window.location.origin;
    setFormLink(`${baseUrl}/jobfair/apply/${userType}`);
  }, [userType]);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    window.history.pushState({}, "", `/jobfair/apply/${type}`);
  };
  // Handle file selection and set up for cropping
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Handle crop completion
  const onImageLoad = (img) => {
    imgRef.current = img;
  };

  // Apply the crop and create the cropped image
  const applyCrop = () => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Convert canvas to blob and update form data
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }

        // Create a file from the blob
        const file = new File([blob], "profile-photo.jpg", {
          type: "image/jpeg",
        });

        // Update form data with the cropped image
        setFormData((prev) => ({
          ...prev,
          profilePhoto: file,
        }));

        // Set preview URL
        setPreviewUrl(URL.createObjectURL(blob));

        // Close the crop dialog
        setImgSrc(null);
      },
      "image/jpeg",
      0.9
    );
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    // Handle file input
    if (name === "profilePhoto") {
      if (files && files[0]) {
        const file = files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          setImgSrc(reader.result);
        };

        reader.readAsDataURL(file);
      }
      return;
    }

    // Check if phone exists when phone field changes
    if (name === "phone") {
      debouncedCheckPhone(value);
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Check if email exists when email field changes
    if (name === "email") {
      debouncedCheckEmail(value);
    }

    // Skip file handling for profile photo as we handle it separately
    if (name === "profilePhoto") {
      return;
    }

    // Handle user type change
    if (name === "userType") {
      handleUserTypeChange(value);
      return;
    }

    // For file inputs, we need to handle them differently
    if (files && files[0]) {
      const file = files[0];
      // Create preview URL for the image
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      // Capitalize first letter of each word for specific fields
      const fieldsToCapitalize = [
        "name",
        "course",
        "college",
        "university",
        "companyName",
      ];
      const processedValue = fieldsToCapitalize.includes(name)
        ? capitalizeWords(value.toLowerCase())
        : value;

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only allow numbers and limit to 6 digits
    setOtp(value);
  };

  const startOtpCountdown = () => {
    setOtpCountdown(60); // 60 seconds countdown
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return;
    }

    try {
      setIsSubmitting(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4002";
      const response = await axios.post(`${apiUrl}/api/candidates/send-otp`, {
        email: formData.email,
      });

      if (response.data.success) {
        setOtpSent(true);
        setShowOtpInput(true);
        startOtpCountdown();
        toast.success("OTP sent to your email");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      setErrors((prev) => ({ ...prev, email: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4002";
      const response = await axios.post(`${apiUrl}/api/candidates/verify-otp`, {
        email: formData.email,
        otp,
      });

      if (response.data.success) {
        setIsEmailVerified(true);
        setShowOtpInput(false);
        toast.success("Email verified successfully");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to verify OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;

    try {
      setIsSubmitting(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4002";
      const response = await axios.post(`${apiUrl}/api/candidates/send-otp`, {
        email: formData.email,
      });

      if (response.data.success) {
        startOtpCountdown();
        toast.success("New OTP sent to your email");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    // Supports international numbers with optional + and country code
    // Examples: +1234567890, 1234567890, +1 (234) 567-8901, 123-456-7890
    const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email is verified
    if (!isEmailVerified) {
      toast.error("Please verify your email before submitting the form");
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(formData.phone)) {
      setErrors((prev) => ({
        ...prev,
        phone:
          "Please enter a valid phone number (10-20 digits, may include +, -, (, ), or spaces",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      // Add isPaymentDone field for company users
      if (userType === "company") {
        formDataToSend.append("isPaymentDone", false);
      }

      // Send the form data to the backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4002";
      await axios.post(`${apiUrl}/api/candidates`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Application submitted successfully!");

      // For Payment
      if (userType === "company") {
        const companyData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          companyName: formData.companyName,
        };
        setCompanyFormData(companyData);

        // Store company registration data in session storage
        sessionStorage.setItem(
          "companyRegistration",
          JSON.stringify(companyData)
        );

        // // Redirect to payment page
        // const paymentModal = document.getElementById("paymentModal");
        // if (paymentModal) {
        //   paymentModal.showModal();
        //   showPaymentModal();
        // } else {
        //   console.error("Payment modal not found");
        //   navigate("/payment", {
        //     state: {
        //       isCompanyRegistration: true,
        //       amount: 4000,
        //       description: "JobFair Registration Fee",
        //       ...companyData, // Spread company data into the state
        //     },
        //   });
        // }
        if (userType === "company") {
          setShowPaymentModal(true);
        } else {
          navigate("/payment", {
            state: {
              isCompanyRegistration: true,
              amount: 4000,
              description: "JobFair Registration Fee",
              ...companyData,
            },
          });
        }
      } else {
        // Original success navigation for non-company users
        navigate("/", {
          state: {
            title: "Application Submitted!",
            message:
              "Thank you for your interest. We will review your application and get back to you soon.",
          },
        });
      }

      // navigate("/", {
      //   state: {
      //     title: "Application Submitted!",
      //     message:
      //       "Thank you for your interest. We will review your application and get back to you soon.",
      //   },
      // });
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response?.data?.field) {
        // Handle duplicate email/phone errors
        const { field, message } = error.response.data;

        // Reset email verification state if phone validation fails
        if (field === "phone") {
          setIsEmailVerified(false);
          setOtpSent(false);
          setShowOtpInput(false);
        }

        setErrors((prev) => ({
          ...prev,
          [field]: message,
        }));
        toast.error(message);
      } else if (error.response?.data?.errors) {
        // Handle other validation errors
        const newErrors = {};
        Object.entries(error.response.data.errors).forEach(([field, err]) => {
          newErrors[field] = err.msg || "Validation error";
          toast.error(err.msg || "Validation error");
        });
        setErrors(newErrors);
      } else {
        // Handle other errors
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to submit application. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-1 md:px-8 lg:px-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-2">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            JobFair Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            After applying, you will receive event details on your registered
            email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* User Type Selection */}
            <div className="hidden">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                I am a *
              </label>
              <div className="flex rounded-lg shadow-md overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange("student")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 focus:outline-none ${
                    userType === "student"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeChange("company")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 focus:outline-none ${
                    userType === "company"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  Company
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="e.g., example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={otpSent || isCheckingEmail}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm p-2 pr-10 border ${
                      errors.email || emailExists
                        ? "border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${otpSent ? "bg-gray-100" : ""}`}
                  />
                  {isCheckingEmail && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-500 animate-spin"
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
                    </div>
                  )}
                  {emailExists && !isCheckingEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {userType === "company"
                        ? formData.phone?.trim()
                          ? ""
                          : "Already registered (For check payment Status Enter Mobile Number)"
                        : "Already registered."}
                    </p>
                  )}
                </div>
                {!emailExists && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting || otpSent || !formData.email}
                    className={`mt-1 inline-flex items-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white h-[40px] ${
                      otpSent
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                  >
                    {otpSent ? "✓ Sent" : "OTP"}
                  </button>
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}

              {/* OTP Verification Section */}
              {showOtpInput && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="block w-40 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isSubmitting || otp.length !== 6}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {otpCountdown > 0 ? (
                      <span>Resend OTP in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isEmailVerified && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <svg
                    className="h-5 w-5 text-green-500 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Email verified successfully
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                placeholder="e.g., 9087616456"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm p-2 border ${
                  errors.phone
                    ? "border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                }`}
              />
              {isCheckingPhone && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-500 animate-spin"
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
                </div>
              )}
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              {phoneExists && !isCheckingPhone && (
                <div>
                  <p className="mt-1 text-sm text-red-600">
                    {userType === "company" || formData.isPaymentDone === false
                      ? formData.email?.trim()
                        ? "Yes your payment is pending. Please complete your payment."
                        : "Already registered (For check payment Status Enter Email Id)"
                      : "Already registered."}
                  </p>
                </div>
              )}
            </div>

            {/* Course */}
            {userType === "student" && (
              <>
                <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                  <label
                    htmlFor="course"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course *
                  </label>
                  <input
                    type="text"
                    name="course"
                    id="course"
                    required={userType === "student"}
                    placeholder="e.g., Computer Science"
                    value={formData.course}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                  <label
                    htmlFor="college"
                    className="block text-sm font-medium text-gray-700"
                  >
                    College *
                  </label>
                  <input
                    type="text"
                    name="college"
                    id="college"
                    required={userType === "student"}
                    placeholder="e.g., IIT Bombay"
                    value={formData.college}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                  <label
                    htmlFor="university"
                    className="block text-sm font-medium text-gray-700"
                  >
                    University *
                  </label>
                  <input
                    type="text"
                    name="university"
                    id="university"
                    required={userType === "student"}
                    placeholder="e.g., Mumbai University"
                    value={formData.university}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
              </>
            )}

            {/* Name */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {userType === "student" ? "Full Name" : "Person Name"} *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="e.g., Anisk Mishra"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            {/* Company Name */}
            {userType === "company" && !emailExists && (
              <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  placeholder="e.g., Tech Solutions Inc."
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            )}

            {/* Payment Button if not paid */}
            <div className="flex items-center justify-end mt-4">
              {(userType === "company" || formData.isPaymentDone === false) &&
              formData.email?.trim() &&
              formData.phone?.trim() &&
              emailExists ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name?.trim()) {
                      toast.error("Please enter Name");
                      return;
                    }
                    if (!formData.email?.trim()) {
                      toast.error("Please enter Email");
                      return;
                    }
                    if (!formData.phone?.trim()) {
                      toast.error("Please enter Phone Number");
                      return;
                    }

                    setCompanyFormData({
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      course: formData.course || "JobFair Registration",
                      userType: "company",
                      isJobFair: true,
                    });
                    setShowPaymentModal(true);
                  }}
                  className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-font-medium rounded-md shadow-sm text-white h-[40px] bg-indigo-600 hover:bg-indigo-7focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Pay Now
                </button>
              ) : null}
            </div>

            {/* Profile Photo */}
            {!emailExists && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {userType === "student"
                    ? "Profile Photo"
                    : "Photo"}{" "}
                  (For Invitation Card)
                </label>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-2 mb-4">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="h-32 w-32 rounded-full object-cover border-2 border-gray-300"
                    />
                  </div>
                )}

                {/* Crop Modal */}
                {imgSrc && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Crop Your Profile Photo
                        </h3>
                        <button
                          onClick={() => setImgSrc(null)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="Close"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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

                      <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">How to crop:</span>{" "}
                          Click and drag to select an area. The selected area
                          will be your profile picture.
                        </p>
                        <div className="relative">
                          <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop={true}
                            className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                          >
                            <img
                              ref={onImageLoad}
                              src={imgSrc}
                              alt="Crop preview"
                              style={{
                                maxHeight: "60vh",
                                maxWidth: "100%",
                                display: "block",
                                margin: "0 auto",
                              }}
                              onLoad={(e) => {
                                // Set initial crop to cover the center of the image
                                const { width, height } = e.target;
                                const size = Math.min(width, height) * 0.95; // 95% of the smaller dimension
                                const x = (width - size) / 2;
                                const y = (height - size) / 2;
                                setCrop({
                                  unit: "px",
                                  width: size,
                                  height: size,
                                  x,
                                  y,
                                });
                              }}
                            />
                          </ReactCrop>
                          {!crop && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center p-4 bg-white/80 rounded-lg">
                                <svg
                                  className="mx-auto h-12 w-12 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                  />
                                </svg>
                                <p className="mt-2 text-sm text-gray-600">
                                  Drag to select an area
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setImgSrc(null)}
                          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (crop) {
                              applyCrop();
                            } else {
                              // If no crop is made, use the full image
                              setCrop({
                                unit: "%",
                                width: 100,
                                height: 100,
                                x: 0,
                                y: 0,
                              });
                              setTimeout(applyCrop, 100);
                            }
                          }}
                          className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Photo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden canvas for image processing */}
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    display: "none",
                  }}
                />
                <div className="mt-1">
                  <input
                    type="file"
                    name="profilePhoto"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="hidden"
                  />
                  <label
                    htmlFor="profilePhoto"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/20000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {previewUrl ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.profilePhoto
                    ? formData.profilePhoto.name
                    : "PNG, JPG, JPEG up to 5MB"}
                </p>
              </div>
            )}
          </div>

          {!emailExists && (
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Apply"}
              </button>
            </div>
          )}
        </form>

        {showPaymentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-[2px]">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="mt-2">
                        {companyFormData && (
                          <PaymentForm
                            className="bg-transparent mt-4"
                            initialData={{
                              ...companyFormData,
                              amount: 4000,
                              course: "JobFair Registration",
                              isJobFair: true,
                            }}
                            onClose={() => {
                              setShowPaymentModal(false);
                              navigate("/", {
                                state: {
                                  title: "Registration Submitted!",
                                  message:
                                    "Thank you for your Registration!",
                                },
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateInviteForm;
