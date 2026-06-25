const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// @desc    Get payment settings
// @route   GET /api/payments
// @access  Public
router.get('/', async (req, res) => {
  try {
    let payment = await Payment.findOne({});
    
    // If no payment config exists, create a default one
    if (!payment) {
      payment = await Payment.create({
        easyPaisa: { accountTitle: 'Hajian Foods EP', mobileNumber: '03001234567', qrCode: '' },
        jazzCash: { accountTitle: 'Hajian Foods JC', mobileNumber: '03151234567', qrCode: '' },
        bank: { bankName: 'Alfalah Bank', accountTitle: 'Hajian Foods', accountNumber: '123456789', iban: 'PK00ALFH123456789' }
      });
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update payment settings
// @route   PUT /api/payments
// @access  Private (Admin)
router.put('/', protect, async (req, res) => {
  const { easyPaisa, jazzCash, bank } = req.body;

  try {
    let payment = await Payment.findOne({});

    if (!payment) {
      payment = new Payment({});
    }

    if (easyPaisa) payment.easyPaisa = { ...payment.easyPaisa, ...easyPaisa };
    if (jazzCash) payment.jazzCash = { ...payment.jazzCash, ...jazzCash };
    if (bank) payment.bank = { ...payment.bank, ...bank };

    const updatedPayment = await payment.save();
    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
