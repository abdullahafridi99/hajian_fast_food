const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const { protect } = require('../middleware/auth');

// @desc    Get all deals
// @route   GET /api/deals
// @access  Public
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find({});
    res.json({ success: true, count: deals.length, data: deals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a deal
// @route   POST /api/deals
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const { title, description, originalPrice, discountPrice, image, startDate, endDate, isActive } = req.body;

  if (!title || originalPrice === undefined || discountPrice === undefined || !image || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const deal = await Deal.create({
      title,
      description,
      originalPrice,
      discountPrice,
      image,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a deal
// @route   PUT /api/deals/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const { title, description, originalPrice, discountPrice, image, startDate, endDate, isActive } = req.body;

  try {
    let deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    if (title) deal.title = title;
    if (description !== undefined) deal.description = description;
    if (originalPrice !== undefined) deal.originalPrice = originalPrice;
    if (discountPrice !== undefined) deal.discountPrice = discountPrice;
    if (image) deal.image = image;
    if (startDate) deal.startDate = new Date(startDate);
    if (endDate) deal.endDate = new Date(endDate);
    if (isActive !== undefined) deal.isActive = isActive;

    const updatedDeal = await deal.save();
    res.json({ success: true, data: updatedDeal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    await deal.deleteOne();
    res.json({ success: true, message: 'Deal removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
