const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Deal = require('../models/Deal');
const Gallery = require('../models/Gallery');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const Testimonial = require('../models/Testimonial');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hajian_foods';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Food.deleteMany({});
    await Deal.deleteMany({});
    await Gallery.deleteMany({});
    await Payment.deleteMany({});
    await Setting.deleteMany({});
    await Testimonial.deleteMany({});

    console.log('Database cleared.');

    // 1. Seed Admin
    console.log('Seeding Admin account...');
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123', // Plain text; pre-save hook in Admin model hashes it once.
      email: 'muhammadab0348@gmail.com',
    });
    console.log(`Admin seeded with username: "admin" and password: "admin123"`);

    // 2. Seed Settings
    console.log('Seeding global site settings...');
    const settings = await Setting.create({
      restaurantName: 'HAJIAN FOODS',
      logo: '',
      slogan: 'GOOD MOOD GOOD FOOD',
      address: 'Kohat Road Near Hajian Hotel, Sra Khawra',
      phone: '03001234567',
      whatsapp: '923001234567',
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

    // 3. Seed Payment Configuration
    console.log('Seeding global payment methods...');
    const payment = await Payment.create({
      easyPaisa: {
        accountTitle: 'HAJIAN FOODS PRIVATE LTD',
        mobileNumber: '03009876543',
        qrCode: '', // QR code can be uploaded via dashboard later
      },
      jazzCash: {
        accountTitle: 'HAJIAN FOODS SHOP',
        mobileNumber: '03123456789',
        qrCode: '',
      },
      bank: {
        bankName: 'Meezan Bank Limited',
        accountTitle: 'HAJIAN FOODS',
        accountNumber: '12340102030405',
        iban: 'PK49MEZN12340102030405',
      }
    });

    // 4. Seed Categories
    console.log('Seeding food categories...');
    const categoryData = [
      { name: 'Burgers', description: 'Gourmet burgers cooked to perfection.' },
      { name: 'Pizza', description: 'Freshly baked pizzas with standard and premium toppings.' },
      { name: 'Broast', description: 'Crispy fried chicken and sides.' },
      { name: 'Fries', description: 'Crispy, hot golden potato fries.' },
      { name: 'Shawarma', description: 'Authentic middle-eastern shawarma wraps.' },
      { name: 'Sandwiches', description: 'Toasted club sandwiches and subs.' },
      { name: 'Drinks', description: 'Chilled carbonated soft drinks and water.' },
      { name: 'Desserts', description: 'Sweet treats to end your meal.' },
    ];

    const seededCategories = {};
    for (const cat of categoryData) {
      const slug = cat.name.toLowerCase();
      const createdCat = await Category.create({
        name: cat.name,
        slug,
        description: cat.description
      });
      seededCategories[cat.name] = createdCat._id;
    }
    console.log('Categories seeded.');

    // 5. Seed Foods
    console.log('Seeding food products...');
    const foodsData = [
      // Burgers
      {
        name: 'Zinger Burger',
        category: seededCategories['Burgers'],
        description: 'Crispy double fried chicken thigh with spicy mayonnaise and shredded lettuce on a toasted bun.',
        price: 320,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Chicken Burger',
        category: seededCategories['Burgers'],
        description: 'Juicy grilled chicken patty topped with melting cheese, tomatoes, onions, and special sauce.',
        price: 280,
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Beef Burger',
        category: seededCategories['Burgers'],
        description: 'Premium grilled beef patty with caramelized onions, cheddar cheese, pickles, and hickory sauce.',
        price: 390,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      // Pizza
      {
        name: 'Chicken Fajita Pizza',
        category: seededCategories['Pizza'],
        description: 'Spicy chicken fajita chunks, bell peppers, onions, tomatoes, and mozzarella cheese.',
        price: 990,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'BBQ Pizza',
        category: seededCategories['Pizza'],
        description: 'Smoky BBQ chicken chunks, red onions, sweet corn, cilantro, and BBQ sauce base.',
        price: 990,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Pepperoni Pizza',
        category: seededCategories['Pizza'],
        description: 'Loads of beef pepperoni slices over classic tomato sauce, topped with rich mozzarella cheese.',
        price: 1100,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Crown Crust Pizza',
        category: seededCategories['Pizza'],
        description: 'Special crown edges stuffed with cheese and kebab, loaded with spicy chicken chunks and vegetables.',
        price: 1350,
        image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Calzone Pizza',
        category: seededCategories['Pizza'],
        description: 'Folded pizza dough stuffed with spiced chicken, cheese, mushrooms, and house garlic sauce.',
        price: 750,
        image: 'https://images.unsplash.com/photo-1621961476495-236b281f6d3f?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Hajian Special Pizza',
        category: seededCategories['Pizza'],
        description: 'Signature pizza loaded with chicken, beef tikka, sausages, mushrooms, olives, peppers, and special white sauce.',
        price: 1450,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      // Broast
      {
        name: 'Crispy Broast',
        category: seededCategories['Broast'],
        description: '4 pieces of double-breaded golden crispy fried chicken served with garlic mayo dip and fries.',
        price: 490,
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Hot Wings',
        category: seededCategories['Broast'],
        description: '10 pieces of hot and spicy breaded chicken wings fried to a golden crisp.',
        price: 350,
        image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Nuggets',
        category: seededCategories['Broast'],
        description: '8 pieces of white chicken breast nuggets, crispy outside and tender inside.',
        price: 290,
        image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      // Fries
      {
        name: 'French Fries',
        category: seededCategories['Fries'],
        description: 'Classic salted French fries, golden brown and crispy.',
        price: 150,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Masala Fries',
        category: seededCategories['Fries'],
        description: 'Crispy fries sprinkled with local spicy chat masala seasoning.',
        price: 170,
        image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      // Drinks
      {
        name: 'Coca Cola',
        category: seededCategories['Drinks'],
        description: 'Chilled 500ml bottle of Coca Cola.',
        price: 80,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      },
      {
        name: 'Sprite',
        category: seededCategories['Drinks'],
        description: 'Chilled 500ml bottle of Sprite.',
        price: 80,
        image: 'https://images.unsplash.com/photo-1625772290748-39093c399e2e?w=600&auto=format&fit=crop&q=80',
        isAvailable: true
      }
    ];

    await Food.insertMany(foodsData);
    console.log('Foods seeded.');

    // 6. Seed Deals
    console.log('Seeding Deals...');
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const dealsData = [
      {
        title: 'Student Deal',
        description: '1 Zinger Burger + 1 Small French Fries + 1 250ml Soft Drink.',
        originalPrice: 480,
        discountPrice: 380,
        image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
        startDate: today,
        endDate: nextMonth,
        isActive: true
      },
      {
        title: 'Double Zinger Deal',
        description: '2 Crispy Zinger Burgers + 1 Large French Fries + 2 250ml Soft Drinks.',
        originalPrice: 900,
        discountPrice: 750,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
        startDate: today,
        endDate: nextMonth,
        isActive: true
      },
      {
        title: 'Family Feast Pizza Deal',
        description: '1 Large Hajian Special Pizza + 1 Zinger Burger + 1.5L Soft Drink.',
        originalPrice: 1850,
        discountPrice: 1550,
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80',
        startDate: today,
        endDate: nextMonth,
        isActive: true
      }
    ];

    await Deal.insertMany(dealsData);
    console.log('Deals seeded.');

    // 7. Seed Gallery
    console.log('Seeding Gallery images...');
    const galleryData = [
      {
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        title: 'Signature Zinger Burger',
        category: 'Food',
        description: 'Crispy fried chicken layered with cheese and fresh lettuce.'
      },
      {
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        title: 'Cheesy Crown Crust Pizza',
        category: 'Food',
        description: 'Mouthwatering crown-stuffed crust loaded with toppings.'
      },
      {
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&auto=format&fit=crop&q=80',
        title: 'Premium Dining Room',
        category: 'Dining',
        description: 'Our luxurious seating area designed for families and friends.'
      },
      {
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        title: 'Chef Preparing Pizzas',
        category: 'Kitchen',
        description: 'Our master chefs crafting pizzas in our highly hygienic kitchen.'
      }
    ];

    await Gallery.insertMany(galleryData);
    console.log('Gallery seeded.');

    // 8. Seed Testimonials
    console.log('Seeding Testimonials...');
    const testimonialsData = [
      {
        name: 'Saad Khan',
        rating: 5,
        review: 'The Hajian Special Pizza is absolutely incredible! Stuffed with cheese and full of flavor. Best food in the area.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        isApproved: true
      },
      {
        name: 'Aisha Bibi',
        rating: 5,
        review: 'Super fast delivery and the Zinger burger was extremely crispy. The student deal is an absolute steal!',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        isApproved: true
      },
      {
        name: 'Umar Farooq',
        rating: 4,
        review: 'Excellent dining experience. The staff was polite and the restaurant environment was clean and neat. Recommended for families.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        isApproved: true
      }
    ];

    await Testimonial.insertMany(testimonialsData);
    console.log('Testimonials seeded.');

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
