// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatme_profiles', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional resizing
  },
});

module.exports = { cloudinary, storage };
