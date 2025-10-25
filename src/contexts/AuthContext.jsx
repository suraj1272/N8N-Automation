import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Function to decode JWT and check expiry
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return token && !isTokenExpired(token);
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Login function (for future use)
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    // Optionally decode user info from token
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser(payload.user || { email: 'user@example.com' }); // Adjust based on your JWT payload
    } catch (error) {
      setUser({ email: 'user@example.com' });
    }
  };

  // Effect to check token on mount and periodically
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  // Periodic check for token expiry (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
