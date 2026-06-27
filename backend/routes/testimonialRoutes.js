const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { protect } = require('../middleware/auth');
const { cleanImage } = require('../utils/imageCleanup');

// @desc    Get approved testimonials for public site
// @route   GET /api/testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all testimonials for admin
// @route   GET /api/testimonials/admin
// @access  Private (Admin)
router.get('/admin', protect, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit a testimonial (pending approval by default)
// @route   POST /api/testimonials
// @access  Public
router.post('/', async (req, res) => {
  const { name, rating, review, image } = req.body;

  if (!name || !rating || !review) {
    return res.status(400).json({ success: false, message: 'Please provide name, rating, and review' });
  }

  try {
    const testimonial = await Testimonial.create({
      name,
      rating,
      review,
      image: image || '',
      isApproved: false, // Moderated by default
    });

    res.status(201).json({ success: true, message: 'Review submitted! It will appear on the website once approved by the admin.', data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Approve/Unapprove a testimonial
// @route   PUT /api/testimonials/:id/approve
// @access  Private (Admin)
router.put('/:id/approve', protect, async (req, res) => {
  const { isApproved } = req.body;

  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    testimonial.isApproved = isApproved !== undefined ? isApproved : true;
    const updatedTestimonial = await testimonial.save();

    res.json({ success: true, data: updatedTestimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    if (testimonial.image) {
      await cleanImage(testimonial.image);
    }
    await testimonial.deleteOne();
    res.json({ success: true, message: 'Testimonial removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
