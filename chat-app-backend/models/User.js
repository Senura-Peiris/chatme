const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profileImageUrl: String, // store Cloudinary URL here
  // other fields...
});

module.exports = mongoose.model("User", userSchema);
