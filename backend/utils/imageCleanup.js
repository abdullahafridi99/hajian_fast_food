const fs = require('fs');
const path = require('path');
const { deleteFromCloudinary } = require('./cloudinaryHelper');

/**
 * Clean up image from either Cloudinary or Local Storage
 * @param {string} url - The URL of the image to clean up
 * @returns {Promise<boolean>}
 */
const cleanImage = async (url) => {
  if (!url) return false;
  try {
    if (url.includes('cloudinary.com')) {
      return await deleteFromCloudinary(url);
    } else if (url.startsWith('/uploads/')) {
      const filename = url.replace('/uploads/', '');
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[CLEANUP] Deleted local file: ${filePath}`);
        return true;
      }
    }
  } catch (error) {
    console.error(`[CLEANUP] Error cleaning up image file: ${url}`, error);
  }
  return false;
};

module.exports = { cleanImage };
