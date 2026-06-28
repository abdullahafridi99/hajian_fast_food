const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { isCloudinaryConfigured, deleteFromCloudinary } = require('../utils/cloudinaryHelper');

// Check and log Cloudinary status
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[CLOUDINARY] Cloudinary initialized. Trying to use Cloudinary for uploads.');
} else {
  console.warn('[WARNING] Cloudinary credentials are not configured. Uploads will be saved to local storage.');
}

// Local upload directory fallback
const uploadDir = path.join(__dirname, '../uploads');

// Multer memory storage
const storage = multer.memoryStorage();

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (Supported formats: JPG, JPEG, PNG, WEBP)'));
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
// @access  Public
router.post('/', (req, res) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Reusable local storage save function
    const saveToLocal = (file, responseObj) => {
      const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
      const filePath = path.join(uploadDir, filename);

      // Create uploads directory if it does not exist
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      } catch (dirErr) {
        console.error('Error creating uploads directory:', dirErr);
      }

      fs.writeFile(filePath, file.buffer, (writeErr) => {
        if (writeErr) {
          console.error('Local file write error:', writeErr);
          return responseObj.status(500).json({ 
            success: false, 
            message: `Local file write failed: ${writeErr.message}` 
          });
        }

        return responseObj.json({
          success: true,
          message: 'Image uploaded successfully to local storage (Fallback)',
          url: `/uploads/${filename}`,
        });
      });
    };

    if (isCloudinaryConfigured) {
      try {
        // Upload to Cloudinary using a buffer stream with optimization settings
        const uploadStream = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'hajian_foods', // Save to a specific folder on Cloudinary
                quality: 'auto',        // Automatic quality optimization
                fetch_format: 'auto',   // Automatic format optimization (WEBP where supported)
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
        console.warn('[CLOUDINARY FALLBACK] Cloudinary upload failed (e.g. bad credentials/timeout). Falling back to local storage. Details:', error.message);
        // Fall back to local disk storage gracefully instead of failing
        return saveToLocal(req.file, res);
      }
    } else {
      // Fallback: Save file to local disk since Cloudinary is not configured
      return saveToLocal(req.file, res);
    }
  });

});

// @desc    Delete an image from Cloudinary or local storage
// @route   DELETE /api/upload
// @access  Public
router.delete('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Image URL is required for deletion' });
  }

  try {
    let deleted = false;

    if (url.includes('cloudinary.com')) {
      deleted = await deleteFromCloudinary(url);
    } else if (url.startsWith('/uploads/')) {
      const filename = url.replace('/uploads/', '');
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted = true;
        console.log(`[LOCAL STORAGE] Deleted local file: ${filePath}`);
      }
    }

    if (deleted) {
      return res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Image not found or could not be deleted' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ success: false, message: `Image deletion failed: ${error.message}` });
  }
});

module.exports = router;
