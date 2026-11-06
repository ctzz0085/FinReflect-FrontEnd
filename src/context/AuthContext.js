import React, { createContext, useContext, useState, useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';
import { getUser, getToken, setUser, setToken, clearUser, clearToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        getUser(),
        getToken()
      ]);
      
      
      if (storedUser && storedToken) {
        setUserState(storedUser);
        setTokenState(storedToken);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, authToken) => {
    
    await Promise.all([
      setUser(userData),
      setToken(authToken)
    ]);
    setUserState(userData);
    setTokenState(authToken);
  };

  const logout = async () => {
    await Promise.all([
      clearUser(),
      clearToken()
    ]);
    setUserState(null);
    setTokenState(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
