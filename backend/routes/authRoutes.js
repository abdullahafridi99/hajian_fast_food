const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const OTP = require('../models/OTP');
const AdminOTP = require('../models/AdminOTP');
const { protect, protectCustomer } = require('../middleware/auth');
const { sendSMS } = require('../utils/smsHelper');
const { sendEmailOTP } = require('../utils/emailHelper');


// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hajian_secret_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      _id: req.admin._id,
      username: req.admin.username,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Request Email OTP for Admin password change
// @route   POST /api/auth/change-password/request-otp
// @access  Private
router.post('/change-password/request-otp', protect, async (req, res) => {
  const { currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Please provide current password' });
  }

  try {
    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const adminEmail = admin.email || process.env.ADMIN_EMAIL || 'muhammadab0348@gmail.com';

    // Check if an OTP was recently sent (enforce 60-second cooldown)
    const existingOtp = await AdminOTP.findOne({ email: adminEmail });
    if (existingOtp) {
      const timeElapsed = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      if (timeElapsed < 60000) {
        const remaining = Math.ceil((60000 - timeElapsed) / 1000);
        return res.status(429).json({ 
          success: false, 
          message: `Please wait ${remaining} seconds before requesting a new OTP.` 
        });
      }
      await AdminOTP.deleteOne({ email: adminEmail });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await AdminOTP.create({
      email: adminEmail,
      otp,
      expiresAt,
      lastSentAt: new Date(),
    });

    // Send email
    await sendEmailOTP(adminEmail, otp);

    // Mask the email for security in UI
    const [namePart, domainPart] = adminEmail.split('@');
    const maskedEmail = namePart.length <= 2 
      ? `${namePart[0]}*@${domainPart}` 
      : `${namePart.substring(0, 2)}***@${domainPart}`;

    res.json({ 
      success: true, 
      message: 'Verification code sent to your email!',
      maskedEmail
    });
  } catch (error) {
    console.error('Error in change-password request-otp:', error);
    res.status(500).json({ success: false, message: 'Server error while sending OTP' });
  }
});

// @desc    Change admin password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword, otp } = req.body;

  if (!currentPassword || !newPassword || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide current password, new password, and email OTP' });
  }

  try {
    const admin = await Admin.findById(req.admin._id);

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const adminEmail = admin.email || process.env.ADMIN_EMAIL || 'muhammadab0348@gmail.com';

    // Verify OTP
    const otpRecord = await AdminOTP.findOne({ email: adminEmail });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Verification code not found or expired. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please try again.' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    // Clean up OTP record
    await AdminOTP.deleteOne({ email: adminEmail });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// CUSTOMER MOBILE OTP AUTHENTICATION ROUTES
// ==========================================

// @desc    Generate and Send OTP to Pakistani Mobile Number
// @route   POST /api/auth/customer/send-otp
// @access  Public
router.post('/customer/send-otp', async (req, res) => {
  const { phoneNumber, name } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required to register/log in.' });
  }

  // Validate Pakistani mobile number: exactly 11 digits, starts with 03
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const pakPhoneRegex = /^03\d{9}$/;
  if (!pakPhoneRegex.test(cleanPhone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid Pakistani mobile number. Must be exactly 11 digits starting with "03" (e.g. 03001234567).' 
    });
  }

  try {
    // Check if an OTP was recently sent (enforce 60-second cooldown)
    const existingOtp = await OTP.findOne({ phoneNumber: cleanPhone });
    if (existingOtp) {
      const timeElapsed = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      if (timeElapsed < 60000) {
        const remaining = Math.ceil((60000 - timeElapsed) / 1000);
        return res.status(429).json({ 
          success: false, 
          message: `Please wait ${remaining} seconds before requesting a new OTP.` 
        });
      }
      // Delete old OTP before creating a new one
      await OTP.deleteOne({ phoneNumber: cleanPhone });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save OTP to DB along with the name
    await OTP.create({
      phoneNumber: cleanPhone,
      name: name.trim(),
      otp,
      expiresAt,
      lastSentAt: new Date(),
    });

    // Send the OTP via SMS using Twilio helper
    const smsSent = await sendSMS(cleanPhone, otp);

    // In development mode, return the OTP in the response payload for easy testing
    const responsePayload = {
      success: true,
      message: smsSent 
        ? 'Verification code sent to your mobile number!' 
        : 'OTP code generated (Twilio offline). Check server logs.',
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.otp = otp; // Expose to frontend for automated/easy testing
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ success: false, message: 'Server error while sending OTP' });
  }
});

// @desc    Verify OTP and log in customer
// @route   POST /api/auth/customer/verify-otp
// @access  Public
router.post('/customer/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
  }

  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

  try {
    const otpRecord = await OTP.findOne({ phoneNumber: cleanPhone });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    // Rate limiting attempts (max 3 failed tries)
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ phoneNumber: cleanPhone });
      return res.status(400).json({ success: false, message: 'Too many invalid attempts. Please request a new OTP.' });
    }

    // Verify match
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 3 - otpRecord.attempts;
      return res.status(400).json({ 
        success: false, 
        message: `Incorrect OTP. You have ${remainingAttempts} attempts remaining.` 
      });
    }

    // OTP matches! Create user if doesn't exist, or update name if does
    let user = await User.findOne({ phoneNumber: cleanPhone });
    if (!user) {
      user = await User.create({
        phoneNumber: cleanPhone,
        name: otpRecord.name || `User-${cleanPhone.substring(7)}`,
      });
    } else if (otpRecord.name) {
      // Update name to match the latest login entry
      user.name = otpRecord.name;
      await user.save();
    }

    // Clear the OTP record to prevent replay attacks
    await OTP.deleteOne({ phoneNumber: cleanPhone });

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
});

// @desc    Get current customer profile
// @route   GET /api/auth/customer/me
// @access  Private (Customer)
router.get('/customer/me', protectCustomer, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        phoneNumber: req.user.phoneNumber,
        name: req.user.name,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


