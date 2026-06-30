import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiLock, FiAlertCircle, FiCheckCircle, FiUser } from 'react-icons/fi';
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
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Compliance states
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
      setCustomerName('');
      setPhoneNumber('');
      setOtp('');
      setError('');
      setDevOtp('');
      setCooldown(0);
      setAgreeTerms(false);
      setAgreePrivacy(false);
    }
  }, [showLoginModal]);

  const handlePhoneChange = (e) => {
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

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (phoneNumber.length !== 11 || !phoneNumber.startsWith('03')) {
      setError('Please enter a valid 11-digit Pakistani mobile number starting with "03".');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      setError('You must accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    setLoading(true);
    setError('');
    setDevOtp('');

    try {
      const res = await sendCustomerOtp(phoneNumber, customerName);
      if (res.success) {
        showToast('OTP code sent successfully!', 'success');
        setStep('otp');
        setCooldown(60);
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
      const res = await sendCustomerOtp(phoneNumber, customerName);
      if (res.success) {
        showToast('New OTP code sent successfully!', 'success');
        setCooldown(60);
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                    👤 Secure Verification
                  </span>
                  <h3 className="text-2xl font-black text-dark mt-2">
                    {step === 'phone' ? 'Customer Sign In' : 'Enter OTP Code'}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    {step === 'phone' 
                      ? 'Sign in or register to place your food orders.' 
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



              {/* Step 1: Phone Input Form */}
              {step === 'phone' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-semibold"
                        required
                        autoFocus
                      />
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">WhatsApp Mobile Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="e.g. 03001234567 (WhatsApp)"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        className="w-full pl-12 pr-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold tracking-wide"
                        required
                      />
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold leading-relaxed block mt-1">
                      Order placement details and updates will be sent to this WhatsApp number.
                    </span>
                  </div>

                  {/* Compliance Checkboxes */}
                  <div className="space-y-3 pt-2 text-xs font-bold text-gray-600">
                    <label className="flex items-start space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer animate-none"
                        required
                      />
                      <span className="leading-relaxed lowercase first-letter:uppercase">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-primary hover:underline font-extrabold inline lowercase first-letter:uppercase"
                        >
                          Terms & Conditions
                        </button>
                      </span>
                    </label>

                    <label className="flex items-start space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer animate-none"
                        required
                      />
                      <span className="leading-relaxed lowercase first-letter:uppercase">
                        I have read and accept the{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-primary hover:underline font-extrabold inline lowercase first-letter:uppercase"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !agreeTerms || !agreePrivacy || !customerName.trim() || phoneNumber.length !== 11}
                    className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="animate-pulse">Sending OTP...</span>
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

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTermsModal(false)}
              className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl p-8 border border-light-gray/20 shadow-premium max-h-[80vh] overflow-y-auto z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-light-gray/10 pb-3">
                <h3 className="text-lg font-black text-dark">Terms & Conditions</h3>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-light rounded-xl"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed space-y-3 font-semibold">
                <p className="font-extrabold text-dark text-sm">1. Introduction</p>
                <p>Welcome to Hajian Foods. By placing an order through our website, you agree to comply with and be bound by the following terms and conditions.</p>
                <p className="font-extrabold text-dark text-sm">2. Ordering & Payment</p>
                <p>All orders placed on our website are subject to acceptance and availability. Prices are listed in Pakistani Rupees (PKR) and are subject to change without notice.</p>
                <p>For Cash on Delivery, you must pay the rider in full at the time of delivery. For EasyPaisa, JazzCash, or Bank Transfers, the transaction screenshot must be uploaded and verified before the order is processed.</p>
                <p className="font-extrabold text-dark text-sm">3. Delivery Policy</p>
                <p>We strive to deliver orders hot and on time. Delivery times are estimates and can vary due to weather, traffic, or other unforeseen events. Free delivery is applicable on orders of Rs. 1000 or above.</p>
                <p className="font-extrabold text-dark text-sm">4. Cancellations & Refunds</p>
                <p>Once an order has entered the "Preparing" phase, cancellation is not possible. If you receive an incorrect or damaged order, please notify us immediately via WhatsApp or Phone for replacement or resolution.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl p-8 border border-light-gray/20 shadow-premium max-h-[80vh] overflow-y-auto z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-light-gray/10 pb-3">
                <h3 className="text-lg font-black text-dark">Privacy Policy</h3>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-light rounded-xl"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed space-y-3 font-semibold">
                <p className="font-extrabold text-dark text-sm">1. Information We Collect</p>
                <p>We collect personal information necessary to process your food orders. This includes your name, verified Pakistani mobile number, complete delivery address, and transaction screenshots for verification of online transfers.</p>
                <p className="font-extrabold text-dark text-sm">2. How We Use Your Information</p>
                <p>We use your information exclusively to process and deliver your orders, contact you regarding delivery status, and verify bank/wallet transfers. We do not sell or share your personal data with third-party advertising companies.</p>
                <p className="font-extrabold text-dark text-sm">3. Data Security</p>
                <p>Your session is secured using JWT authentication, and your phone number is verified via a secure OTP process. Transferred receipt images are stored securely on Cloudinary and are only accessible by restaurant administration for audit purposes.</p>
                <p className="font-extrabold text-dark text-sm">4. Cookies & Local Storage</p>
                <p>We use browser local storage to persist your active cart items and login session across page refreshes for your convenience.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoginModal;
