import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        ...userData
      };
      
      console.log('Setting auth user with data:', userWithRole);
      localStorage.setItem("Users", JSON.stringify(userWithRole));
      setAuthUser(userWithRole);
    } else {
      // Logout
      console.log('Logging out user');
      localStorage.removeItem("Users");
      localStorage.removeItem("token");
      setAuthUser(null);
    }
  }, []);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("Users");
        const token = localStorage.getItem("token");
        
        console.log('Loading user from localStorage:', { 
          hasUserData: !!userData, 
          hasToken: !!token 
        });
        
        if (userData && token) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user data:', parsedUser);
            
            // Verify token with backend if needed
            // const { data } = await api.get('/users/me');
            // if (!data.success) throw new Error('Invalid token');
            
            // Ensure user has required fields
            const userWithRole = {
              _id: parsedUser._id,
              fullname: parsedUser.fullname || parsedUser.name || 'User',
              email: parsedUser.email,
              role: parsedUser.role || 'user',
              ...parsedUser
            };
            
            console.log('Setting initial auth user:', userWithRole);
            setAuthUser(userWithRole);
          } catch (error) {
            console.error('Error validating user session:', error);
            // Clear invalid data
            localStorage.removeItem("Users");
            localStorage.removeItem("token");
            setAuthUser(null);
          }
        } else {
          console.log('No valid user data or token found in localStorage');
          setAuthUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // Clear any potentially corrupted data
        localStorage.removeItem("Users");
        localStorage.removeItem("token");
        setAuthUser(null);
      } finally {
        // Add a small delay to prevent flash of unauthorized content
        setTimeout(() => setLoading(false), 500);
      }
    };

    loadUser();
  }, []);

  // Debug auth state changes
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!authUser,
      userRole: authUser?.role,
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
      authUser, 
      setAuthUser: updateAuthUser,
      isAuthenticated: !!authUser,
      isAdmin: authUser?.role === 'admin',
      loading
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
