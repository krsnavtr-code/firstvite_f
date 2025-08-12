import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const RegisterForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Prepare user data
      const userData = {
        fullname: data.fullname, // Changed from name to fullname to match backend
        email: data.email,
        password: data.password,
        role: data.role || "student", // Default to student if not specified
        department: data.department,
        phone: data.phone,
      };

      // Make API call to register
      const response = await api.post("/auth/register", userData);

      // Show success message
      toast.success("Registration successful! Please wait for admin approval.");

      // Call the success handler if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-3xl font-extrabold text-gray-900 ">
          Create your account
        </p>
      </div>
      <div>
        <label
          htmlFor="fullname"
          className="block text-sm font-medium text-black "
        >
          Full Name
        </label>
        <input
          id="fullname"
          type="text"
          {...register("fullname", { required: "Full name is required" })}
          className={`block w-full px-3 py-1 border bg-gray-50 border-gray-800 text-black ${
            errors.fullname
              ? "border-red-500"
              : "border-gray-300 "
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm  `}
        />
        {errors.fullname && (
          <p className="text-sm text-red-600">{errors.fullname.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-black "
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className={`block w-full px-3 py-1 border bg-gray-50 border-gray-800 text-black ${
            errors.email
              ? "border-red-500"
              : "border-gray-300 "
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm  `}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-black "
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9]{10,15}$/,
              message: "Please enter a valid phone number",
            },
          })}
          className={`block w-full px-3 py-1 border bg-gray-50 border-gray-800 text-black ${
            errors.phone
              ? "border-red-500"
              : "border-gray-300 "
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm  `}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-black "
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          className={`block w-full px-3 py-1 border bg-gray-50 border-gray-800 text-black ${
            errors.password
              ? "border-red-500"
              : "border-gray-300 "
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm  `}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-black "
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", {
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          })}
          className={`block w-full px-3 py-1 border bg-gray-50 border-gray-800 text-black ${
            errors.confirmPassword
              ? "border-red-500"
              : "border-gray-300 "
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm  `}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium  text-black "
        >
          I am a
        </label> 
        <select
          id="role"
          {...register("role", { required: "Please select a role" })}
          className="mt-1 w-full border-gray-800 py-2 sm:text-sm rounded-md  bg-gray-50 text-black"
          defaultValue="student"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="department"
          className="block text-sm font-medium text-black "
        >
          Department
        </label>
        <input
          id="department"
          type="text"
          {...register("department", { required: "Department is required" })}
          className={`block w-full px-3 py-1 border bg-gray-50 border-gray-800 text-black ${
            errors.department
              ? "border-red-500"
              : "border-gray-300 "
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm  `}
        />
        {errors.department && (
          <p className="text-sm text-red-600">{errors.department.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-1 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </div>

      <div className="text-sm text-center">
        <span className="text-black ">
          Already have an account?{" "}
        </span>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-medium text-blue-600 hover:text-blue-500 "
        >
          Sign in
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
