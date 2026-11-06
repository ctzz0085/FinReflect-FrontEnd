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
      
      console.log('AuthContext - Stored User:', storedUser);
      console.log('AuthContext - User ID:', storedUser?.userId);
      console.log('AuthContext - User Email:', storedUser?.email);
      
      if (storedUser && storedToken) {
        setUserState(storedUser);
        setTokenState(storedToken);
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, authToken) => {
    console.log('AuthContext - Login - User Data:', userData);
    console.log('AuthContext - Login - User ID:', userData?.userId);
    console.log('AuthContext - Login - User Email:', userData?.email);
    
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
