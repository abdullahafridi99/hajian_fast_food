import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUser, FiPhone, FiMapPin, FiCreditCard, FiUpload, FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { paymentDetails } = useSettings();
  const { customer, customerToken, customerLoading, setShowLoginModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Shipping form state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Compliance Checkbox states
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Order submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Protect page: redirect to cart if not logged in
  useEffect(() => {
    if (!customerLoading && !customerToken) {
      navigate('/cart');
      setShowLoginModal(true);
      showToast('Please sign in to access the secure checkout.', 'warning');
    }
  }, [customerToken, customerLoading, navigate, setShowLoginModal]);

  // Pre-fill phone number and name from customer profile
  useEffect(() => {
    if (customer) {
      setPhoneNumber(customer.phoneNumber);
      if (customer.name && !customerName) {
        setCustomerName(customer.name);
      }
    }
  }, [customer]);


  // Delivery policy: free delivery for orders above Rs. 1000, else Rs. 100
  const deliveryCharge = cartTotal >= 1000 ? 0 : 100;
  const grandTotal = cartTotal + deliveryCharge;

  // Handle Receipt Upload
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      showToast('File size exceeds the 5MB limit.', 'error');
      return;
    }

    setUploading(true);
    setUploadError('');
    setReceiptFile(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setReceiptUrl(response.data.url);
        showToast('Receipt screenshot uploaded successfully!', 'success');
      }
    } catch (error) {
      console.error('Error uploading receipt screenshot:', error);
      const errMsg = error.response?.data?.message || 'Failed to upload image. Please try again.';
      setUploadError(errMsg);
      showToast(errMsg, 'error');
      setReceiptFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!customerToken) {
      showToast('Your session has expired. Please log in again.', 'error');
      setShowLoginModal(true);
      return;
    }

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }

    // Validation for Pakistani phone number
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const pakPhoneRegex = /^03[0-9]{9}$/;
    if (!pakPhoneRegex.test(cleanPhone)) {
      setPhoneError('Please enter a valid Pakistani mobile number starting with "03" (e.g. 03001234567).');
      showToast('Invalid Pakistani mobile number.', 'error');
      return;
    }

    // Validation for digital transfers
    if (paymentMethod !== 'Cash on Delivery' && !receiptUrl) {
      setSubmitError('Please upload a screenshot of your transaction receipt for verification.');
      showToast('Please upload transaction screenshot.', 'warning');
      return;
    }

    // Checkbox compliance validation
    if (!agreeTerms || !agreePrivacy) {
      setSubmitError('You must accept the Terms & Conditions and Privacy Policy to place an order.');
      showToast('Please accept Terms and Privacy Policy.', 'warning');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const orderData = {
        customerName,
        phoneNumber,
        address,
        items: cartItems.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          itemType: item.itemType,
        })),
        totalAmount: grandTotal,
        paymentMethod,
        receiptImage: receiptUrl || undefined,
      };

      const response = await axios.post('/api/orders', orderData);
      if (response.data.success) {
        const orderId = response.data.data._id;
        clearCart();
        showToast('Your order has been placed successfully!', 'success');
        navigate(`/order-details/${orderId}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errMsg = error.response?.data?.message || 'Something went wrong while placing your order. Please try again.';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Header */}
      <section className="pb-6 border-b border-light-gray/20">
        <span className="bg-primary/10 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
          🔒 Secure Checkout
        </span>
        <h1 className="text-4xl font-black text-dark mt-3">Place Your Order</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your delivery and payment details to finish.</p>
      </section>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 font-bold">No items in your cart to checkout. Redirecting...</p>
          <button onClick={() => navigate('/menu')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl">
            Go to Menu
          </button>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Checkout Details Columns (Col span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Customer Info */}
            <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-6">
              <h3 className="text-lg font-bold text-dark flex items-center space-x-2 border-b border-light-gray/10 pb-4">
                <FiUser className="text-primary w-5 h-5" />
                <span>1. Delivery Information</span>
              </h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all"
                      required
                    />
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Phone Number (Verified)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-light-gray/40 rounded-xl focus:outline-none text-sm text-gray-500 cursor-not-allowed font-semibold"
                      readOnly
                      disabled
                    />
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>


                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Complete Address</label>
                  <div className="relative">
                    <textarea
                      rows="3"
                      placeholder="House number, street address, sector/locality, near landmarks"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none"
                      required
                    ></textarea>
                    <FiMapPin className="absolute left-4 top-6 text-gray-400 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method selection */}
            <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-6">
              <h3 className="text-lg font-bold text-dark flex items-center space-x-2 border-b border-light-gray/10 pb-4">
                <FiCreditCard className="text-primary w-5 h-5" />
                <span>2. Select Payment Method</span>
              </h3>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Cash on Delivery', 'EasyPaisa', 'JazzCash', 'Bank Transfer'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method);
                      setSubmitError('');
                    }}
                    className={`py-3.5 px-3 rounded-2xl text-xs font-black uppercase tracking-wider text-center transition-all duration-300 border ${
                      paymentMethod === method
                        ? 'bg-primary text-white border-primary shadow'
                        : 'bg-light text-dark/70 border-light-gray/30 hover:bg-gray-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Dynamic instruction panel based on paymentMethod */}
              <div className="p-6 rounded-2xl bg-light border border-light-gray/20 space-y-4">
                {paymentMethod === 'Cash on Delivery' && (
                  <div className="text-xs text-gray-500 leading-relaxed space-y-2">
                    <p className="font-bold text-dark uppercase tracking-wider">📦 Pay on Delivery</p>
                    <p>Simply verify your phone number and address. You will pay the rider in cash when they deliver your hot food.</p>
                  </div>
                )}

                {paymentMethod === 'EasyPaisa' && (
                  <div className="space-y-4 text-xs">
                    <p className="font-bold text-dark uppercase tracking-wider">📲 EasyPaisa Transfer Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-gray-400">Account Title:</p>
                        <p className="font-extrabold text-sm text-dark">{paymentDetails.easyPaisa.accountTitle || 'Hajian Foods'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">EasyPaisa Mobile Number:</p>
                        <p className="font-extrabold text-sm text-primary">{paymentDetails.easyPaisa.mobileNumber || '03001234567'}</p>
                      </div>
                    </div>

                    {paymentDetails.easyPaisa.qrCode && (
                      <div className="space-y-2">
                        <p className="text-gray-400">Scan QR Code to Pay:</p>
                        <img
                          src={paymentDetails.easyPaisa.qrCode}
                          alt="EasyPaisa QR Code"
                          className="w-36 h-36 object-contain rounded-xl border border-light-gray bg-white p-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'JazzCash' && (
                  <div className="space-y-4 text-xs">
                    <p className="font-bold text-dark uppercase tracking-wider">📲 JazzCash Transfer Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-gray-400">Account Title:</p>
                        <p className="font-extrabold text-sm text-dark">{paymentDetails.jazzCash.accountTitle || 'Hajian Foods'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">JazzCash Mobile Number:</p>
                        <p className="font-extrabold text-sm text-primary">{paymentDetails.jazzCash.mobileNumber || '03151234567'}</p>
                      </div>
                    </div>

                    {paymentDetails.jazzCash.qrCode && (
                      <div className="space-y-2">
                        <p className="text-gray-400">Scan QR Code to Pay:</p>
                        <img
                          src={paymentDetails.jazzCash.qrCode}
                          alt="JazzCash QR Code"
                          className="w-36 h-36 object-contain rounded-xl border border-light-gray bg-white p-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <div className="space-y-4 text-xs">
                    <p className="font-bold text-dark uppercase tracking-wider">🏦 Bank Account details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-gray-400">Bank Name:</p>
                        <p className="font-extrabold text-sm text-dark">{paymentDetails.bank.bankName || 'Meezan Bank'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Account Title:</p>
                        <p className="font-extrabold text-sm text-dark">{paymentDetails.bank.accountTitle || 'Hajian Foods'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Account Number:</p>
                        <p className="font-extrabold text-sm text-primary">{paymentDetails.bank.accountNumber || '123456789'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">IBAN Number:</p>
                        <p className="font-extrabold text-xs text-dark">{paymentDetails.bank.iban || 'PK00MEZN123456789'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital receipt file uploader */}
                {paymentMethod !== 'Cash on Delivery' && (
                  <div className="pt-4 border-t border-light-gray/20 space-y-3">
                    <p className="font-bold text-dark text-xs uppercase tracking-wide">
                      📤 Upload Payment Screenshot
                    </p>
                    <p className="text-gray-500 text-[10px] leading-relaxed">
                      Please send the order amount to the details above, take a screenshot of your successful transaction, and upload it below so the administration can verify and approve your order.
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-light-gray rounded-xl cursor-pointer hover:bg-gray-50 text-xs font-bold text-dark/80 select-none shadow-sm">
                        <FiUpload className="w-4 h-4 text-primary" />
                        <span>Choose Screenshot</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                          required={paymentMethod !== 'Cash on Delivery'}
                        />
                      </label>
                      {uploading && <span className="text-[10px] text-gray-500 animate-pulse font-medium">Uploading image...</span>}
                      {receiptUrl && (
                        <span className="flex items-center space-x-1 text-xs text-green-600 font-extrabold">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Receipt Uploaded</span>
                        </span>
                      )}
                    </div>

                    {uploadError && <p className="text-red-600 text-[10px] font-bold">{uploadError}</p>}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Checkout Totals Column */}
          <div className="bg-white rounded-3xl p-8 border border-light-gray/20 shadow-premium space-y-6">
            <h3 className="text-xl font-bold text-dark border-b border-light-gray/20 pb-4">
              Your Order
            </h3>

            {/* Compact items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.itemId}-${item.itemType}`} className="flex justify-between items-start text-xs border-b border-light-gray/10 pb-2">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-extrabold text-dark line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 font-bold">Qty: {item.quantity} x Rs. {item.price}</p>
                  </div>
                  <span className="font-extrabold text-dark">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-3 text-xs font-bold uppercase tracking-wider text-gray-500 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-dark">Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-dark">
                  {deliveryCharge === 0 ? <span className="text-green-600 font-black">Free</span> : `Rs. ${deliveryCharge}`}
                </span>
              </div>
              <hr className="border-light-gray/20" />
              <div className="flex justify-between text-dark pt-2">
                <span className="text-sm font-black">Grand Total</span>
                <span className="text-xl font-black text-primary">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Legal Compliance Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-light-gray/10 text-xs font-bold text-gray-600">
              <label className="flex items-start space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
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
                  className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
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

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-start space-x-2">
                <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || uploading || !agreeTerms || !agreePrivacy}
              className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Placing Order...' : 'Confirm Order'}</span>
            </button>
          </div>

        </form>
      )}

      {/* Terms & Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

    </div>
  );
};

export default Checkout;

