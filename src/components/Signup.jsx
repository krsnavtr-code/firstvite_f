import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { setAuthUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  // Open modal when component mounts or location changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      const modal = document.getElementById("signup_modal");
      if (modal) {
        modal.showModal();
      }
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.getElementById("signup_modal");
      // Only close if clicking directly on the overlay (not on any content)
      if (event.target === modal) {
        modal.close();
      }
    };

    // Add event listener when component mounts
    document.addEventListener('click', handleClickOutside);
    
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const onSubmit = async (data) => {
    const userInfo = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      department: data.department,
    };

    try {
      setIsSubmitting(true);
      const response = await api.post("/users/signup", userInfo);

      if (response.data) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        const userData = response.data.user || response.data.data;
        if (userData) {
          setAuthUser(userData);
          toast.success("Signup successful!");
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage =
        err.response?.data?.message || "Signup failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <dialog 
        id="signup_modal" 
        className="modal"
      >
        <div 
          ref={modalRef} 
          className="modal-box dark:bg-slate-800 w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit(onSubmit)} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("signup_modal").close()}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg">Signup</h3>
            <div className="mt-4 space-y-2">
              <span>Name</span>
              <br />
              <input
                type="text"
                placeholder="Enter your fullname"
                className="w-80 px-3 py-1 border rounded-md outline-none dark:bg-slate-900 dark:text-white"
                {...register("fullname", { required: true })}
              />
              <br />
              {errors.fullname && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            {/* Email */}
            <div className="mt-4 space-y-2">
              <span>Email</span>
              <br />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-80 px-3 py-1 border rounded-md outline-none dark:bg-slate-900 dark:text-white"
                {...register("email", { required: true })}
              />
              <br />
              {errors.email && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            {/* Password */}
            <div className="mt-4 space-y-2">
              <span>Password</span>
              <br />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-80 px-3 py-1 border rounded-md outline-none dark:bg-slate-900 dark:text-white"
                {...register("password", { required: true })}
              />
              <br />
              {errors.password && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            
            {/* Department */}
            <div className="mt-4 space-y-2">
              <span>Department</span>
              <br />
              <select
                className="w-80 px-3 py-1 border rounded-md outline-none dark:bg-slate-900 dark:text-white"
                {...register("department", { required: true })}
                defaultValue=""
              >
                <option value="" disabled>Select your department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
                <option value="Other">Other</option>
              </select>
              <br />
              {errors.department && (
                <span className="text-sm text-red-500">
                  Please select a department
                </span>
              )}
            </div>
            {/* Button */}
            <div className="flex justify-around flex-col items-center gap-2 mt-6">
              <button
                className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200 disabled:opacity-50 w-24"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing up...' : 'Signup'}
              </button>
              <p className="dark:text-white">
                Already have an account?
                <button 
                  type="button"
                  className="underline text-blue-500 cursor-pointer"
                  onClick={() => {
                    document.getElementById("signup_modal").close();
                    navigate('/login');
                    // Small timeout to ensure the route updates before showing the modal
                    setTimeout(() => {
                      document.getElementById("my_modal_3").showModal();
                    }, 0);
                  }}
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
       </dialog>
    </div>
  );
}

export default Signup;
