const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find({}).populate('category');
    res.json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category');
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a food item
// @route   POST /api/foods
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  const { name, category, description, price, image, isAvailable } = req.body;

  if (!name || !category || !price || !image) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields (name, category, price, image)' });
  }

  try {
    const food = await Food.create({
      name,
      category,
      description,
      price,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const populatedFood = await Food.findById(food._id).populate('category');
    res.status(201).json({ success: true, data: populatedFood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  const { name, category, description, price, image, isAvailable } = req.body;

  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (name) food.name = name;
    if (category) food.category = category;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = price;
    if (image) food.image = image;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    const updatedFood = await food.save();
    const populatedFood = await Food.findById(updatedFood._id).populate('category');

    res.json({ success: true, data: populatedFood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    await food.deleteOne();
    res.json({ success: true, message: 'Food item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
