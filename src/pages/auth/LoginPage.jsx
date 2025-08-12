import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [message, setMessage] = useState(location.state?.message || "");
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (error === "not_approved") {
      setMessage(
        "Your account is pending admin approval. Please contact support."
      );
    } else if (error === "account_suspended") {
      setMessage("Your account has been deactivated. Please contact support.");
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const onSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const loginResponse = await login(formData.email, formData.password);
      if (loginResponse) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-500 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden grid md:grid-cols-2">
        {/* Left Side - Welcome */}
        <div className="bg-gradient-to-br from-orange-500 to-blue-500 text-white flex flex-col justify-center p-8 relative">
          {/* Home icon button */}
          <Link to="/" className="text-white absolute top-4 left-8">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 1.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 9.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1V9.414l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold mb-4">Welcome to FirstVITE</h1>
          <p className="text-sm opacity-90">
            To make high-quality education accessible online, helping learners
            gain practical, job-ready skills in trending domains.
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 flex flex-col justify-center">
          {message && (
            <div
              className={`mb-4 p-3 rounded text-sm ${
                error ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              {message}
            </div>
          )}

          <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
            Login to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black "
            >
              Email address
            </label>
            <input
              type="email"
              placeholder="Email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}

            <label
              htmlFor="password"
              className="block text-sm font-medium text-black "
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-black gap-2">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
