const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (So customer can track order)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
  const { customerName, phoneNumber, address, items, totalAmount, paymentMethod, receiptImage } = req.body;

  if (!customerName || !phoneNumber || !address || !items || items.length === 0 || !totalAmount || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Please fill in all order details and add items to cart' });
  }

  // Validate Pakistani phone number format
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  const pakPhoneRegex = /^(?:\+92|92|0)?3[0-9]{9}$/;
  if (!pakPhoneRegex.test(cleanPhone)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).' });
  }

  try {
    // If digital payment, set paymentStatus to "Pending Verification"
    const paymentStatus = (paymentMethod !== 'Cash on Delivery') ? 'Pending Verification' : 'Pending';

    const order = await Order.create({
      customerName,
      phoneNumber,
      address,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      receiptImage,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
