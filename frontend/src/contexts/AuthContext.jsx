import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingSession, setProcessingSession] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    checkExistingSession();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('session_id=')) {
      processSessionId(hash);
    }
  }, []);

  const checkExistingSession = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const processSessionId = async (hash) => {
    setProcessingSession(true);
    
    try {
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setProcessingSession(false);
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Session error:', error);
      window.history.replaceState(null, '', window.location.pathname);
    } finally {
      setProcessingSession(false);
    }
  };

  const login = () => {
    const redirectUrl = window.location.origin;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    user,
    loading,
    processingSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
