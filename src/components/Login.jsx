import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useState } from "react";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const { setAuthUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In Login.jsx, update the onSubmit function:
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log('Login - Attempting login with:', data);
      
      // Clear any existing tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('Users');
      
      const response = await api.post("/users/login", data);
      console.log('Login - Response received:', response.data);

      if (response.data.success) {
        // Extract token and user data from response
        const token = response.data.token || response.data.data?.token || response.data.data?.accessToken;
        let userData = response.data.user || response.data.data?.user || response.data.data;
        
        // If user data is nested in a data property, use that
        if (response.data.data && typeof response.data.data === 'object' && !userData?._id) {
          userData = response.data.data;
        }

        console.log('Login - Extracted user data:', userData);
        
        if (!token) {
          throw new Error('No authentication token received');
        }

        // Store the token in localStorage
        localStorage.setItem("token", token);
        console.log('Login - Token stored in localStorage');

        // Ensure user data has required fields
        const userWithRole = {
          _id: userData._id,
          fullname: userData.fullname || userData.name || 'User',
          email: userData.email,
          role: userData.role || 'user',
          ...userData
        };

        console.log('Login - Updating auth context with user:', userWithRole);
        
        // Store user data in localStorage
        localStorage.setItem("Users", JSON.stringify(userWithRole));
        
        // Update auth context
        setAuthUser(userWithRole);
        
        // Show success message
        toast.success("Login successful!");

        // Close the login modal if it exists
        const modal = document.getElementById("my_modal_3");
        if (modal) {
          modal.close();
        }

        // Get redirect URL from query params or default to home
        const urlParams = new URLSearchParams(window.location.search);
        let redirectTo = urlParams.get("redirect");
        
        // If no redirect specified and user is admin, go to admin dashboard
        if (userWithRole.role === 'admin') {
          redirectTo = '/admin/dashboard';
          console.log('Login - User is admin, redirecting to admin dashboard');
        }
        
        // Default to home if no specific redirect
        redirectTo = redirectTo || '/';
        
        console.log('Login - Final redirect to:', redirectTo);
        navigate(redirectTo, { replace: true });
      } else {
        const errorMsg = response.data.message || 'Login failed';
        console.error('Login - Server error:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleSubmit(onSubmit)} method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <Link
              to="/"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              ✕
            </Link>

            <h3 className="font-bold text-lg">Login</h3>
            {/* Email */}
            <div className="mt-4 space-y-2">
              <span>Email</span>
              <br />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-80 px-3 py-1 border rounded-md outline-none"
                {...register("email", { required: true })}
              />
              <br />
              {errors.email && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            {/* password */}
            <div className="mt-4 space-y-2">
              <span>Password</span>
              <br />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-80 px-3 py-1 border rounded-md outline-none"
                {...register("password", { required: true })}
              />
              <br />
              {errors.password && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>

            {/* Button */}
            <div className="flex justify-around mt-6">
              <button
                className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              <p>
                Not registered?{" "}
                <Link
                  to="/signup"
                  className="underline text-blue-500 cursor-pointer"
                >
                  Signup
                </Link>{" "}
              </p>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Login;
