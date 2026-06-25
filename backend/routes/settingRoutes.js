const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    
    // If no settings exist, create a default configuration
    if (!settings) {
      settings = await Setting.create({
        restaurantName: 'HAJIAN FOODS',
        logo: '',
        slogan: 'GOOD MOOD GOOD FOOD',
        address: 'Kohat Road Near Hajian Hotel, Sra Khawra',
        phone: '03001234567',
        whatsapp: '03001234567',
        email: 'info@hajianfoods.com',
        socialLinks: {
          facebook: 'https://facebook.com/hajianfoods',
          instagram: 'https://instagram.com/hajianfoods',
          tiktok: 'https://tiktok.com/@hajianfoods',
          whatsapp: 'https://wa.me/923001234567',
        },
        heroSection: {
          heading: 'HAJIAN FOODS',
          slogan: 'GOOD MOOD GOOD FOOD',
          description: 'Serving delicious fast food made with fresh ingredients, premium quality, and unforgettable taste.',
        }
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private (Admin)
router.put('/', protect, async (req, res) => {
  const { restaurantName, logo, slogan, address, phone, whatsapp, email, socialLinks, heroSection } = req.body;

  try {
    let settings = await Setting.findOne({});

    if (!settings) {
      settings = new Setting({});
    }

    if (restaurantName) settings.restaurantName = restaurantName;
    if (logo !== undefined) settings.logo = logo;
    if (slogan) settings.slogan = slogan;
    if (address) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (whatsapp !== undefined) settings.whatsapp = whatsapp;
    if (email !== undefined) settings.email = email;
    
    if (socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    }
    
    if (heroSection) {
      settings.heroSection = { ...settings.heroSection, ...heroSection };
    }

    const updatedSettings = await settings.save();
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
