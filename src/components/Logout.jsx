import React from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Logout({ className = "" }) {
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      // Clear user data from context and localStorage
      setAuthUser(null);
      
      // Show success message
      toast.success("Logged out successfully!");
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/")
      }, 1000);
      
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };
  
  return (
    <button
      className={`px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer transition-colors duration-200 ${className}`}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}

export default Logout;
