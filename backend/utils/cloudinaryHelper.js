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
}

/**
 * Extracts the public_id from a Cloudinary URL
 * @param {string} url - The absolute Cloudinary secure URL
 * @returns {string|null} The public_id or null if not valid
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    let path = parts[1];
    
    // Remove version segment (e.g. v1719234857) if it exists
    const pathParts = path.split('/');
    if (pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1))) {
      pathParts.shift();
    }
    path = pathParts.join('/');
    
    // Remove extension
    const extIndex = path.lastIndexOf('.');
    if (extIndex !== -1) {
      path = path.substring(0, extIndex);
    }
    return path;
  } catch (error) {
    console.error('Error parsing public_id from Cloudinary URL:', error);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary by its URL
 * @param {string} url - The Cloudinary URL of the image to delete
 * @returns {Promise<boolean>} Resolves to true if deleted successfully, false otherwise
 */
const deleteFromCloudinary = async (url) => {
  if (!isCloudinaryConfigured) return false;
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return false;
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[CLOUDINARY] Deleted image: ${publicId}`, result);
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error(`[CLOUDINARY] Failed to delete image: ${publicId}`, error);
    return false;
  }
};

module.exports = {
  isCloudinaryConfigured,
  getPublicIdFromUrl,
  deleteFromCloudinary,
};
