import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api',
  withCredentials: true
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Login function
  const login = async (email, password) => {
    try {
      // Clear any existing auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call the login API
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        const { token, user } = response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        // Store the token
        localStorage.setItem('token', token);
        setToken(token);
        
        // Set default auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update auth user
        if (user) {
          updateAuthUser(user);
        } else {
          // If no user data in response, fetch it
          await loadUser();
        }
        
        return true;
      } else {
        // Handle case where success is false or no token
        const errorMessage = response.data.message || 'Login failed. Please try again.';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any partial auth state on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setAuthUser(null);
      delete api.defaults.headers.common['Authorization'];
      
      if (error.response) {
        // Handle specific error responses
        if (error.response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (error.response.status === 403) {
          throw new Error('Account not approved. Please wait for admin approval.');
        } else if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      // Re-throw the error with a user-friendly message
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  // Logout function
  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setAuthUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  // Update both auth state and localStorage
  const updateAuthUser = useCallback((userData) => {
    console.log('Updating auth user:', userData);
    
    if (userData) {
      // Ensure user has required fields
      const userWithRole = {
        _id: userData._id,
        fullname: userData.fullname || userData.name || 'User',
        email: userData.email,
        role: userData.role || 'user',
        isApproved: userData.isApproved || false,
        ...userData
      };
      
      console.log('Setting auth user with data:', userWithRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setAuthUser(userWithRole);
      
      // Update axios headers if we have a token
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      }
    } else {
      // Logout
      console.log('Logging out user');
      logout();
    }
  }, []);

  // Load user from token on initial render
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // If no token, set loading to false immediately
    if (!storedToken) {
      console.log('No token found in localStorage');
      setLoading(false);
      return;
    }
    
    // Set the auth header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    
    // Set initial user from localStorage while we verify the token
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthUser(parsedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
      }
    }
    
    try {
      // Verify token and get fresh user data
      const response = await api.get('/auth/me');
      console.log('Auth me response:', response.data);
      
      if (response.data.success && response.data.user) {
        // Update auth user with fresh data from the server
        updateAuthUser(response.data.user);
      } else {
        console.log('No valid user data in response, logging out');
        // If no valid user data, clear the token
        logout();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // If token is invalid or other error, clear it
      if (!error.response || error.response.status === 401) {
        console.log('Token invalid or expired, logging out');
        logout();
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
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!authUser,
      userRole: authUser?.role,
      isApproved: authUser?.isApproved,
      loading 
    });
  }, [authUser, loading]);

  // Only render children once we've tried to load the user
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      // State
      authUser, 
      token,
      loading,
      
      // Computed
      isAuthenticated: !!authUser,
      isAdmin: authUser?.role === 'admin',
      isApproved: authUser?.isApproved === true,
      
      // Actions
      login,
      logout,
      setAuthUser: updateAuthUser,
      api // Expose the configured axios instance
    }}>
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
