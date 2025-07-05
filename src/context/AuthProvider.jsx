import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("Users");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setAuthUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
        // Clear invalid data
        localStorage.removeItem("Users");
        localStorage.removeItem("token");
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Update both auth state and localStorage
  const updateAuthUser = useCallback((userData) => {
    if (userData) {
      localStorage.setItem("Users", JSON.stringify(userData));
      setAuthUser(userData);
    } else {
      // Logout
      localStorage.removeItem("Users");
      localStorage.removeItem("token");
      setAuthUser(null);
    }
  }, []);

  // Only render children once we've tried to load the user
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser: updateAuthUser }}>
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
