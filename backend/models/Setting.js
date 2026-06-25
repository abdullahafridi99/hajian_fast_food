const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: true,
      default: 'HAJIAN FOODS',
    },
    logo: {
      type: String,
      default: '',
    },
    slogan: {
      type: String,
      default: 'GOOD MOOD GOOD FOOD',
    },
    address: {
      type: String,
      default: 'Kohat Road Near Hajian Hotel, Sra Khawra',
    },
    phone: {
      type: String,
      default: '',
    },
    whatsapp: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
    },
    heroSection: {
      heading: { type: String, default: 'HAJIAN FOODS' },
      slogan: { type: String, default: 'GOOD MOOD GOOD FOOD' },
      description: { type: String, default: 'Serving delicious fast food made with fresh ingredients, premium quality, and unforgettable taste.' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
