const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');
const { cleanImage } = require('../utils/imageCleanup');

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({});
    res.json({ success: true, count: galleryItems.length, data: galleryItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a gallery item
// @route   POST /api/gallery
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const { image, title, category, description } = req.body;

  if (!image || !title || !category) {
    return res.status(400).json({ success: false, message: 'Please provide image, title, and category' });
  }

  try {
    const galleryItem = await Gallery.create({
      image,
      title,
      category,
      description,
    });

    res.status(201).json({ success: true, data: galleryItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const { image, title, category, description } = req.body;

  try {
    let galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    if (title) galleryItem.title = title;
    if (category) galleryItem.category = category;
    if (description !== undefined) galleryItem.description = description;

    if (image && image !== galleryItem.image) {
      await cleanImage(galleryItem.image);
      galleryItem.image = image;
    }

    const updatedItem = await galleryItem.save();
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    await cleanImage(galleryItem.image);
    await galleryItem.deleteOne();
    res.json({ success: true, message: 'Gallery item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
