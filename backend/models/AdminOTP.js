const mongoose = require('mongoose');

const adminOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  }
});

// TTL index to automatically delete expired OTPs
adminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminOTP', adminOtpSchema);
