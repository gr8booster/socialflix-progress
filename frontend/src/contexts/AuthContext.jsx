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

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Process session_id from URL fragment after OAuth redirect
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
      console.log('No existing session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const processSessionId = async (hash) => {
    setProcessingSession(true);
    
    try {
      // Extract session_id from URL fragment
      const params = new URLSearchParams(hash.substring(1));
      const sessionId = params.get('session_id');

      if (!sessionId) {
        console.error('No session_id found in URL');
        setProcessingSession(false);
        return;
      }

      // Call backend to process session
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/session`,
        { session_id: sessionId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        
        // Clean URL fragment
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Error processing session:', error);
    } finally {
      setProcessingSession(false);
    }
  };

  const login = () => {
    // Redirect to Emergent Auth with redirect_url pointing to main app
    const redirectUrl = window.location.origin;
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    
    // For mobile browsers, ensure we're doing a full page redirect
    // Use window.top to break out of any iframe context
    if (window.top) {
      window.top.location.href = authUrl;
    } else {
      window.location.href = authUrl;
    }
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
