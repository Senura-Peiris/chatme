const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null },  // filename of image
});

module.exports = mongoose.model('User', userSchema);
