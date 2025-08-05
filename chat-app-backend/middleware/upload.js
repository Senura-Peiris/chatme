// middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // save in uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueName = 'profileImage-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WEBP images are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
