const mongoose = require('mongoose');

// Global flag to track connection status
let isDbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hajian_foods');
    isDbConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    console.warn('\n================================================================');
    console.warn('WARNING: Failed to connect to MongoDB Database.');
    console.warn(`Error Details: ${error.message}`);
    console.warn('Please make sure MongoDB is running locally or specify a valid');
    console.warn('MONGODB_URI in the backend/.env file (e.g. MongoDB Atlas).');
    console.warn('================================================================\n');
  }
};

const getDbStatus = () => isDbConnected;

module.exports = { connectDB, getDbStatus };

