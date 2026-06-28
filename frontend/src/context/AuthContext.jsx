import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { showToast } = useToast();

  // Admin auth states
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [loading, setLoading] = useState(true);

  // Customer auth states
  const [customer, setCustomer] = useState(null);
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('customerToken') || null);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Set default axios authorization header depending on active session
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else if (customerToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${customerToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, customerToken]);

  // Verify Admin Auth
  const checkAdminAuth = async () => {
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAdmin(response.data);
      } else {
        adminLogout();
      }
    } catch (error) {
      console.error('Error verifying admin token:', error);
      adminLogout();
    } finally {
      setLoading(false);
    }
  };

  // Verify Customer Auth
  const checkCustomerAuth = async () => {
    if (!customerToken) {
      setCustomer(null);
      setCustomerLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/customer/me', {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      if (response.data.success) {
        setCustomer(response.data.data);
      } else {
        customerLogout();
      }
    } catch (error) {
      console.error('Error verifying customer token:', error);
      customerLogout();
    } finally {
      setCustomerLoading(false);
    }
  };


  // Check auth on load
  useEffect(() => {
    checkAdminAuth();
    checkCustomerAuth();
  }, [token, customerToken]);

  // Inactivity Auto Logout for Admin (15 minutes)
  useEffect(() => {
    if (!token || !admin) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    let lastActivity = Date.now();

    const handleActivity = () => {
      lastActivity = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    const interval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime >= INACTIVITY_TIMEOUT) {
        adminLogout();
        showToast('Your session has expired due to inactivity. Please log in again.', 'warning');
      }
    }, 10000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [token, admin]);

  // Admin Login
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      if (response.data.success) {
        const { token: userToken, username: name, _id } = response.data;
        localStorage.setItem('adminToken', userToken);
        setToken(userToken);
        setAdmin({ _id, username: name });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  // Admin Logout
  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
    if (!customerToken) {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // ==========================================
  // CUSTOMER MOBILE OTP AUTHENTICATION METHODS
  // ==========================================

  // Request OTP for customer phone number
  const sendCustomerOtp = async (phoneNumber, name) => {
    try {
      const response = await axios.post('/api/auth/customer/send-otp', { phoneNumber, name });
      return response.data; // contains { success, message, otp (in dev) }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };


  // Verify OTP and complete customer login
  const verifyCustomerOtp = async (phoneNumber, otp) => {
    try {
      const response = await axios.post('/api/auth/customer/verify-otp', { phoneNumber, otp });
      if (response.data.success) {
        const { token: userToken, user } = response.data;
        localStorage.setItem('customerToken', userToken);
        setCustomerToken(userToken);
        setCustomer(user);
        return { success: true, user };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid OTP verification code.');
    }
  };

  // Customer Logout (Preserves Cart!)
  const customerLogout = () => {
    localStorage.removeItem('customerToken');
    setCustomerToken(null);
    setCustomer(null);
    if (!token) {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        // Admin
        admin,
        token,
        loading,
        login,
        logout: adminLogout,
        checkAuth: checkAdminAuth,
        
        // Customer
        customer,
        customerToken,
        customerLoading,
        showLoginModal,
        setShowLoginModal,
        sendCustomerOtp,
        verifyCustomerOtp,
        customerLogout,
        checkCustomerAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
