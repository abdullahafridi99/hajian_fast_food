import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { FiCheckCircle, FiSettings, FiPhone, FiInfo, FiLock } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const ManageSettings = () => {
  const { refreshAll } = useSettings();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwStep, setPwStep] = useState('request'); // 'request' or 'verify'
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // Setting States
  const [restaurantName, setRestaurantName] = useState('HAJIAN FOODS');
  const [slogan, setSlogan] = useState('GOOD MOOD GOOD FOOD');
  const [address, setAddress] = useState('Kohat Road Near Hajian Hotel, Sra Khawra');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  
  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
  });

  // Hero Section
  const [heroSection, setHeroSection] = useState({
    heading: 'HAJIAN FOODS',
    slogan: 'GOOD MOOD GOOD FOOD',
    description: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data.success) {
          const s = response.data.data;
          setRestaurantName(s.restaurantName || 'HAJIAN FOODS');
          setSlogan(s.slogan || 'GOOD MOOD GOOD FOOD');
          setAddress(s.address || 'Kohat Road Near Hajian Hotel, Sra Khawra');
          setPhone(s.phone || '');
          setWhatsapp(s.whatsapp || '');
          setEmail(s.email || '');
          setSocialLinks(s.socialLinks || { facebook: '', instagram: '', tiktok: '', whatsapp: '' });
          setHeroSection(s.heroSection || { heading: 'HAJIAN FOODS', slogan: 'GOOD MOOD GOOD FOOD', description: '' });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      const response = await axios.put('/api/settings', {
        restaurantName,
        slogan,
        address,
        phone,
        whatsapp,
        email,
        socialLinks,
        heroSection,
      });

      if (response.data.success) {
        setSuccess(true);
        refreshAll(); // Refresh settings context
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess(false);
    setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long');
      return;
    }

    setPwSubmitting(true);
    try {
      if (pwStep === 'request') {
        const response = await axios.post('/api/auth/change-password/request-otp', {
          currentPassword,
        });

        if (response.data.success) {
          setPwStep('verify');
          setMaskedEmail(response.data.maskedEmail);
        }
      } else {
        const response = await axios.put('/api/auth/change-password', {
          currentPassword,
          newPassword,
          otp,
        });

        if (response.data.success) {
          setPwSuccess(true);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setOtp('');
          setPwStep('request');
        }
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPwError(
        err.response?.data?.message || 'Failed to process request. Please try again.'
      );
    } finally {
      setPwSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header section */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-dark">Website Configuration</h1>
          <p className="text-gray-500 text-xs">Manage general branding text, physical address coordinates, and main hero banners.</p>
        </div>
      </section>

      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-2xl border border-green-200 text-xs font-bold flex items-center space-x-2">
          <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span>Brand configuration updated successfully! Changes are live on the website.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs font-medium text-gray-600">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* General Brand Details */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6">
            <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
              <FiSettings className="text-primary w-5 h-5" />
              <span>1. General Branding & Contacts</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Restaurant Name</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Slogan</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Physical Address</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none text-dark font-bold"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">WhatsApp (No prefix/symbols)</label>
                  <input
                    type="text"
                    placeholder="e.g. 923001234567"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. contact@hajianfoods.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-bold"
                />
              </div>
            </div>
          </div>

          {/* Social Handles */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6">
            <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
              <FaFacebook className="text-primary w-5 h-5" />
              <span>2. Social Channels & Handles</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500 flex items-center space-x-1">
                  <FaFacebook className="text-blue-600" />
                  <span>Facebook Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500 flex items-center space-x-1">
                  <FaInstagram className="text-pink-600" />
                  <span>Instagram Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500 flex items-center space-x-1">
                  <FaTiktok className="text-black" />
                  <span>TikTok Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@..."
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500 flex items-center space-x-1">
                  <FaWhatsapp className="text-green-500" />
                  <span>WhatsApp API Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://wa.me/..."
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark"
                />
              </div>
            </div>
          </div>

          {/* Hero Content Area */}
          <div className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
              <FiInfo className="text-primary w-5 h-5" />
              <span>3. Landing Hero Section Content</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Hero Main Title</label>
                <input
                  type="text"
                  value={heroSection.heading}
                  onChange={(e) => setHeroSection({ ...heroSection, heading: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-extrabold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Hero Slogan</label>
                <input
                  type="text"
                  value={heroSection.slogan}
                  onChange={(e) => setHeroSection({ ...heroSection, slogan: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark font-bold"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Hero Description Paragraph</label>
                <textarea
                  rows="3"
                  value={heroSection.description}
                  onChange={(e) => setHeroSection({ ...heroSection, description: e.target.value })}
                  className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all resize-none text-dark"
                  required
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
        >
          {submitting ? 'Saving Settings...' : 'Save Website Settings'}
        </button>

      </form>

      {/* Change Password Form Card */}
      <section className="bg-white rounded-3xl border border-light-gray/20 p-8 shadow-premium space-y-6 max-w-2xl text-xs font-medium text-gray-600 mt-12">
        <h3 className="text-lg font-bold text-dark border-b border-light-gray/10 pb-3 flex items-center space-x-2">
          <FiLock className="text-primary w-5 h-5" />
          <span>Change Admin Password</span>
        </h3>

        {pwSuccess && (
          <div className="bg-green-50 text-green-800 p-4 rounded-2xl border border-green-200 text-xs font-bold flex items-center space-x-2">
            <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Password changed successfully!</span>
          </div>
        )}

        {pwError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs font-bold">
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              required
              disabled={pwStep === 'verify'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                required
                disabled={pwStep === 'verify'}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-light border border-light-gray/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                required
                disabled={pwStep === 'verify'}
              />
            </div>
          </div>

          {pwStep === 'verify' && (
            <div className="space-y-1 bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wide text-primary">Email Verification Code (OTP)</label>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                An OTP has been sent to your registered email: <strong className="text-dark font-black">{maskedEmail}</strong>. Please check your inbox or spam folder.
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit email OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm focus:border-primary transition-all text-center font-extrabold tracking-widest text-dark"
                required
              />
            </div>
          )}

          <div className="flex gap-4">
            {pwStep === 'verify' && (
              <button
                type="button"
                onClick={() => {
                  setPwStep('request');
                  setOtp('');
                  setPwError('');
                }}
                className="flex-1 py-4 rounded-xl border border-light-gray/40 hover:bg-light text-dark font-extrabold uppercase text-xs tracking-wider transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={pwSubmitting}
              className="flex-grow py-4 rounded-xl bg-primary text-white hover:bg-secondary hover:text-dark-darker font-extrabold uppercase text-xs tracking-wider transition-all shadow-md disabled:bg-gray-300"
            >
              {pwSubmitting 
                ? (pwStep === 'request' ? 'Requesting OTP...' : 'Updating Password...') 
                : (pwStep === 'request' ? 'Request Password Change OTP' : 'Verify & Change Password')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ManageSettings;
