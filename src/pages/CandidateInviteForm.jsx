import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const CandidateInviteForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    college: "",
    university: "",
    profilePhoto: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  
  // Clean up object URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

    // Validate phone number
    if (!validatePhoneNumber(formData.phone)) {
      setErrors((prev) => ({
        ...prev,
        phone:
          "Please enter a valid phone number (10-20 digits, may include +, -, (, ), or spaces)",
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

      // Send the form data to the backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4002";
      await axios.post(`${apiUrl}/api/candidates`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Application submitted successfully!");
      navigate("/", {
        state: {
          title: "Application Submitted!",
          message:
            "Thank you for your interest. We will review your application and get back to you soon.",
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response?.data?.field) {
        // Handle duplicate email/phone errors
        const { field, message } = error.response.data;
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Candidate Application
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please fill in your details to apply
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name *
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

            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., example@gmail.com"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm p-2 border ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
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
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
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
                required
                placeholder="e.g., B.Tech"
                value={formData.course}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
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
                required
                placeholder="e.g., IIT"
                value={formData.college}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
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
                required
                placeholder="e.g., IIT"
                value={formData.university}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo
              </label>
              
              {/* Image Preview */}
              {(previewUrl || formData.profilePhoto) && (
                <div className="mt-2 mb-4">
                  <img 
                    src={previewUrl || URL.createObjectURL(formData.profilePhoto)} 
                    alt="Profile preview" 
                    className="h-32 w-32 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
              )}
              
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  name="profilePhoto"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.profilePhoto
                  ? formData.profilePhoto.name
                  : "PNG, JPG, JPEG up to 5MB"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateInviteForm;
