const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    easyPaisa: {
      accountTitle: { type: String, default: '' },
      mobileNumber: { type: String, default: '' },
      qrCode: { type: String, default: '' },
    },
    jazzCash: {
      accountTitle: { type: String, default: '' },
      mobileNumber: { type: String, default: '' },
      qrCode: { type: String, default: '' },
    },
    bank: {
      bankName: { type: String, default: '' },
      accountTitle: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      iban: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
