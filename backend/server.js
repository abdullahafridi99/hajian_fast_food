const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { connectDB } = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");
const dealRoutes = require("./routes/dealRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const settingRoutes = require("./routes/settingRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serves static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/upload", uploadRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Hajian Foods API Server is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Only listen if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
  });
}

module.exports = app;
