const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('[WARNING] Cloudinary credentials are not configured. Uploads will be saved to local storage.');
}

// Local upload directory fallback
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage (holds file in memory buffer so we can stream to Cloudinary or write locally)
const storage = multer.memoryStorage();

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (Support formats: JPG, JPEG, PNG, WEBP)'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Public (so customers can upload receipts; admin uploads are also handled here)
router.post('/', (req, res) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ success: false, message: `Multer upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (isCloudinaryConfigured) {
      try {
        // Upload to Cloudinary using a buffer stream
        const uploadStream = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'hajian_foods', // Save to a specific folder on Cloudinary
              },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            // End the stream with the file buffer
            stream.end(req.file.buffer);
          });
        };

        const result = await uploadStream();

        return res.json({
          success: true,
          message: 'Image uploaded successfully to Cloudinary',
          url: result.secure_url, // Return the absolute Cloudinary secure URL
        });
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ 
          success: false, 
          message: `Cloudinary upload failed: ${error.message}` 
        });
      }
    } else {
      // Fallback: Save file to local disk since Cloudinary is not configured
      const filename = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFile(filePath, req.file.buffer, (writeErr) => {
        if (writeErr) {
          console.error('Local file write error:', writeErr);
          return res.status(500).json({ 
            success: false, 
            message: `Local file write failed: ${writeErr.message}` 
          });
        }

        return res.json({
          success: true,
          message: 'Image uploaded successfully to local storage (Fallback)',
          url: `/uploads/${filename}`,
        });
      });
    }
  });
});

module.exports = router;
