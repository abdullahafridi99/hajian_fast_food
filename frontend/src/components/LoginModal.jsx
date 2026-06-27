import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginModal = () => {
  const { 
    showLoginModal, 
    setShowLoginModal, 
    sendCustomerOtp, 
    verifyCustomerOtp 
  } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // Stores the OTP returned in dev mode
  const [cooldown, setCooldown] = useState(0);

  // Handle Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset state on modal close
  useEffect(() => {
    if (!showLoginModal) {
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
      setError('');
      setDevOtp('');
      setCooldown(0);
    }
  }, [showLoginModal]);

  const handlePhoneChange = (e) => {
    // Only allow numbers and limit to 11 characters
    const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(cleanVal);
    setError('');
  };

  const handleOtpChange = (e) => {
    const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleanVal);
    setError('');
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 11 || !phoneNumber.startsWith('03')) {
      setError('Please enter a valid 11-digit Pakistani mobile number starting with "03".');
      return;
    }

    setLoading(true);
    setError('');
    setDevOtp('');

    try {
      const res = await sendCustomerOtp(phoneNumber);
      if (res.success) {
        showToast('OTP code sent successfully!', 'success');
        setStep('otp');
        setCooldown(60);
        if (res.otp) {
          setDevOtp(res.otp); // Save dev-mode OTP to display to user
        }
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('OTP code must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyCustomerOtp(phoneNumber, otp);
      if (res.success) {
        showToast('Successfully logged in!', 'success');
        setShowLoginModal(false);
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError('');
    setOtp('');

    try {
      const res = await sendCustomerOtp(phoneNumber);
      if (res.success) {
        showToast('New OTP code sent successfully!', 'success');
        setCooldown(60);
        if (res.otp) {
          setDevOtp(res.otp);
        }
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginModal(false)}
            className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-8 border border-light-gray/20 shadow-premium overflow-hidden z-10 space-y-6"
          >
            {/* Corner styling block */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -z-10" />

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-primary/10 text-primary text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  👤 Customer Verification
                </span>
                <h3 className="text-2xl font-black text-dark mt-2">
                  {step === 'phone' ? 'Verify Mobile Number' : 'Enter OTP Code'}
                </h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {step === 'phone' 
                    ? 'Enter your Pakistani mobile number to receive a secure OTP code.' 
                    : `We sent a 6-digit code to ${phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}`}
                </p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-2 text-gray-400 hover:text-primary transition-colors bg-light rounded-xl"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-start space-x-2">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Dev Mode OTP helper */}
            {devOtp && (
              <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 text-xs font-bold flex flex-col gap-1">
                <div className="flex items-center space-x-1">
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                  <span>[Testing Helper] OTP Sent:</span>
                </div>
                <p className="text-lg font-black tracking-widest text-primary mt-1">{devOtp}</p>
                <p className="text-[10px] text-green-600/80 font-semibold uppercase">Use this code above for quick login verification</p>
              </div>
            )}

            {/* Step 1: Phone Input Form */}
            {step === 'phone' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Pakistani Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold tracking-wide"
                      required
                      autoFocus
                    />
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold leading-relaxed block mt-1">
                    Format: 11 digits starting with 03 (No country code, symbols, or spaces)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300"
                >
                  {loading ? (
                    <span className="animate-pulse">Generating OTP...</span>
                  ) : (
                    <span>Request Verification Code</span>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Entry Form */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">6-Digit Verification Code</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Enter 6-digit OTP code"
                      value={otp}
                      onChange={handleOtpChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold tracking-widest text-center"
                      required
                      autoFocus
                    />
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300"
                >
                  {loading ? (
                    <span className="animate-pulse">Verifying Code...</span>
                  ) : (
                    <span>Confirm & Verify OTP</span>
                  )}
                </button>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setDevOtp('');
                      setError('');
                    }}
                    className="font-bold text-gray-500 hover:text-primary transition-colors"
                  >
                    Change Number
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || loading}
                    className={`font-black uppercase tracking-wider text-[10px] ${
                      cooldown > 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary hover:text-secondary'
                    }`}
                  >
                    {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
