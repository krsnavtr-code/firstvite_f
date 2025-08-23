import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        // If no tokens, clear everything and return
        if (!token || !refreshToken) {
          if (isMounted) {
            setCurrentUser(null);
            setLoading(false);
          }
          // Clear any partial data
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          return;
        }

        // Set the auth header for the initial request
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          // Get fresh user data
          const response = await api.get("/auth/profile");
          console.log("User profile data:", response.data);

          if (response.data && isMounted) {
            // Store the updated user data
            const userData = {
              _id: response.data._id,
              fullname: response.data.fullname,
              email: response.data.email,
              role: response.data.role,
              isApproved: response.data.isApproved,
              isActive: response.data.isActive !== false, // Default to true if not specified
              phone: response.data.phone || "",
              address: response.data.address || "",
            };

            console.log("Setting user data with isApproved:", userData.isApproved);

            localStorage.setItem("user", JSON.stringify(userData));
            setCurrentUser(userData);

            // Handle redirects based on user status
            if (!userData.isActive) {
              if (window.location.pathname !== "/suspended") {
                window.location.href = "/suspended";
              }
            } else if (window.location.pathname === "/suspended") {
              window.location.href = "/";
            }

            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Auth verification failed:", error);

          // If we get a 401, the interceptor will handle token refresh
          if (error.response?.status === 401) {
            console.log(
              "Authentication token is invalid or expired, attempting refresh..."
            );

            try {
              // Try to refresh the token
              const refreshResponse = await api.post("/auth/refresh-token", {
                refreshToken: localStorage.getItem("refreshToken"),
              });

              if (refreshResponse.data.token) {
                const {
                  token: newToken,
                  refreshToken: newRefreshToken,
                  user,
                } = refreshResponse.data;

                console.log("Token refresh successful");

                // Update tokens in localStorage
                localStorage.setItem("token", newToken);
                if (newRefreshToken) {
                  localStorage.setItem("refreshToken", newRefreshToken);
                }

                // Update the authorization header
                api.defaults.headers.common[
                  "Authorization"
                ] = `Bearer ${newToken}`;

                // Update user data
                const userData = {
                  _id: user._id,
                  fullname: user.fullname,
                  email: user.email,
                  role: user.role,
                  isActive: user.isActive !== false, // Default to true if not specified
                  isApproved: user.isApproved,
                  phone: user.phone || "",
                  address: user.address || "",
                };

                localStorage.setItem("user", JSON.stringify(userData));

                if (isMounted) {
                  setCurrentUser(userData);
                  setLoading(false);
                }
                return;
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              // Clear auth data on refresh failure
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");

              if (isMounted) {
                setCurrentUser(null);
                setLoading(false);

                // Only redirect if not already on login page
                if (!window.location.pathname.includes("/login")) {
                  navigate("/login", { replace: true });
                }
              }
              return;
            }
          } else {
            console.error("Network or server error during auth check:", error);
            // For other errors, we'll still clear the auth data to be safe
            if (isMounted) {
              setCurrentUser(null);
              setLoading(false);
            }
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");

            // Only redirect if not already on login page
            if (!window.location.pathname.includes("/login")) {
              navigate("/login", { replace: true });
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error during auth check:", error);
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          navigate("/login", { replace: true });
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const response = await api.post("/auth/login", { email, password });

      console.log("Login response:", response.data);

      if (
        response.data &&
        response.data.success &&
        response.data.token &&
        response.data.refreshToken
      ) {
        const { token, refreshToken, user } = response.data;

        console.log("Login successful, storing tokens and user data");

        // Store tokens
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);

        if (!user) {
          throw new Error("User data not found in response");
        }

        // Store user data
        const userData = {
          _id: user._id,
          fullname: user.fullname || "",
          email: user.email || "",
          role: user.role || "user",
          isApproved: user.isApproved, // Use the value directly from the server
          isActive: user.isActive !== false, // Default to true if not specified
          phone: user.phone || "",
          address: user.address || "",
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentUser(userData);

        // Set the auth header for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        console.log("Login complete, redirecting to dashboard");

        // Show success message
        message.success("Login successful!");

        // Redirect to dashboard or the originally requested page
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get("redirect") || "/dashboard";
        navigate(redirectTo, { replace: true });

        return { success: true };
      }

      console.error("Login failed: No token in response");
      return {
        success: false,
        message: "Invalid response from server. Please try again.",
      };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);

        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request:", error.request);
        errorMessage =
          "No response from server. Please check your internet connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error:", error.message);
        errorMessage = error.message || errorMessage;
      }

      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      message.success("Registration successful! Please login.");
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      message.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user...");

    try {
      // Clear all auth-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Clear auth header
      delete api.defaults.headers.common["Authorization"];

      // Reset user state
      setCurrentUser(null);

      console.log("User logged out successfully");

      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, still try to clear state and redirect
      setCurrentUser(null);
      navigate("/login", { replace: true });
    }
    message.success("Logged out successfully");
  };

  // Update user function
  const updateUser = (userData) => {
    setCurrentUser((prev) => {
      const updatedUser = {
        ...prev,
        ...userData,
      };

      // Also update localStorage to persist the changes
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return updatedUser;
    });
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isApproved: currentUser?.isApproved || false,
    isAdmin: currentUser?.role === 'admin',
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
