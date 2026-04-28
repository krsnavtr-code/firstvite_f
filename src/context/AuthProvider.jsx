import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios.js"; // Import the axios instance with refresh token logic

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Login function
  const login = async (email, password) => {
    try {
      // Clear any existing auth state
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Call the login API
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success && response.data.token) {
        const { token, refreshToken, user } = response.data;

        console.log("Login successful:", {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          hasUser: !!user,
          tokenLength: token?.length,
          refreshTokenLength: refreshToken?.length,
        });

        if (!token) {
          throw new Error("No token received from server");
        }

        // Store the tokens
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
          console.log("Stored refresh token");
        } else {
          console.log("No refresh token received");
        }
        setToken(token);

        console.log("Tokens stored in localStorage");

        // Set default auth header
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Update auth user
        if (user) {
          console.log("Updating auth user from login response");
          updateAuthUser(user);
        } else {
          // If no user data in response, fetch it
          console.log("No user data in response, calling loadUser");
          await loadUser();
        }

        return true;
      } else {
        // Handle case where success is false or no token
        const errorMessage =
          response.data.message || "Login failed. Please try again.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Clear any partial auth state on error
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setToken(null);
      setAuthUser(null);
      delete api.defaults.headers.common["Authorization"];

      if (error.response) {
        // Handle specific error responses
        if (error.response.status === 401) {
          throw new Error("Invalid email or password");
        } else if (error.response.status === 403) {
          throw new Error(
            "Account not approved. Please wait for admin approval.",
          );
        } else if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }

      // Re-throw the error with a user-friendly message
      throw new Error(error.message || "Login failed. Please try again.");
    }
  };

  // Logout function
  const logout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setAuthUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  // Update both auth state and localStorage
  const updateAuthUser = useCallback((userData) => {
    if (userData) {
      // Ensure user has required fields
      const userWithRole = {
        _id: userData._id,
        fullname: userData.fullname || userData.name || "User",
        email: userData.email,
        role: userData.role || "user",
        isApproved: userData.isApproved || false,
        ...userData,
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));
      setAuthUser(userWithRole);

      // Update axios headers if we have a token
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      }
    } else {
      // Logout
      logout();
    }
  }, []);

  // Load user from token on initial render
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    console.log("loadUser called:", {
      hasToken: !!storedToken,
      hasRefreshToken: !!storedRefreshToken,
      hasUser: !!storedUser,
      tokenLength: storedToken?.length,
    });

    // If no token, set loading to false immediately
    if (!storedToken) {
      console.log("No token found, setting loading to false");
      setLoading(false);
      return;
    }

    // Set the auth header immediately
    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

    // Set initial user from localStorage while we verify the token
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthUser(parsedUser);
        console.log("Set initial user from localStorage:", parsedUser.email);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }

    try {
      // Verify token and get fresh user data
      console.log("Making request to /auth/me");
      const response = await api.get("/auth/me");

      console.log("/auth/me response:", response.status, response.data);

      if (response.data.success && response.data.user) {
        // Update auth user with fresh data from the server
        updateAuthUser(response.data.user);
        console.log("Successfully updated user from server");
      } else {
        // If no valid user data, clear the token
        console.log("Invalid response from /auth/me, logging out");
        logout();
      }
    } catch (error) {
      console.error("Error loading user:", error);
      console.error("Error response:", error.response);

      // If token is invalid or other error, clear it
      if (!error.response || error.response.status === 401) {
        console.log("401 error detected, logging out");
        logout();
      } else {
        // For other errors, don't log out immediately
        console.log("Non-401 error, keeping user logged in");
      }
    } finally {
      // Ensure we always set loading to false, even if there was an error
      setLoading(false);
    }
  }, [updateAuthUser]);

  // Load user on mount and when token changes
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Debug auth state changes
  useEffect(() => {}, [authUser, loading]);

  // Only render children once we've tried to load the user
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        // State
        authUser,
        token,
        loading,

        // Computed
        isAuthenticated: !!authUser,
        isAdmin: authUser?.role === "admin",
        isApproved: authUser?.isApproved === true,

        // Actions
        login,
        logout,
        setAuthUser: updateAuthUser,
        api, // Expose the configured axios instance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export the configured axios instance for direct use if needed
export { api };
