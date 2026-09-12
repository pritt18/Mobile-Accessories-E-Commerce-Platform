import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mobixia_user') || localStorage.getItem('nexgear_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mobixia_token') || localStorage.getItem('nexgear_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data?.success) {
          setUser(res.data.data);
          localStorage.setItem('mobixia_user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.warn('Profile fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (identifier, password, rememberMe = true) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data?.success) {
        const { user: userData, accessToken } = res.data.data;
        setUser(userData);
        setToken(accessToken);
        if (rememberMe) {
          localStorage.setItem('mobixia_token', accessToken);
          localStorage.setItem('mobixia_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('mobixia_token', accessToken);
          sessionStorage.setItem('mobixia_user', JSON.stringify(userData));
        }
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const sendOtp = async (recipient, type = 'REGISTRATION') => {
    try {
      const res = await api.post('/auth/send-otp', { recipient, type });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (recipient, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { recipient, otp });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to verify OTP' };
    }
  };

  const register = async ({ name, email, mobile, password, otp }) => {
    try {
      const res = await api.post('/auth/register', { name, email, mobile, password, otp });
      if (res.data?.success) {
        const { user: userData, accessToken } = res.data.data;
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('mobixia_token', accessToken);
        localStorage.setItem('mobixia_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const forgotPassword = async (identifier) => {
    try {
      const res = await api.post('/auth/forgot-password', { identifier });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to request password reset' };
    }
  };

  const resetPassword = async (identifier, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { identifier, otp, newPassword });
      return res.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to reset password' };
    }
  };

  const googleLogin = async (googleUser) => {
    try {
      const res = await api.post('/auth/google', googleUser);
      if (res.data?.success) {
        const { user: userData, accessToken } = res.data.data;
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('mobixia_token', accessToken);
        localStorage.setItem('mobixia_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Google sign-in failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google sign-in failed' };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await api.delete('/auth/account');
      if (res.data?.success) {
        logout();
        return { success: true, message: res.data?.message };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to deactivate account' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mobixia_token');
    localStorage.removeItem('mobixia_user');
    localStorage.removeItem('nexgear_token');
    localStorage.removeItem('nexgear_user');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role);
  const isCustomer = user?.role === 'CUSTOMER';

  const hasPermission = (module, action) => {
    if (isSuperAdmin) return true;
    if (!user?.permissions) return false;
    return user.permissions.includes(`${module}.${action}`) || user.permissions.includes(`${module}.all`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        googleLogin,
        deleteAccount,
        logout,
        isSuperAdmin,
        isAdmin,
        isStaff,
        isCustomer,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
