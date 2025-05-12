// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // e.g., 'mycloud'
  api_key: process.env.CLOUDINARY_API_KEY, // e.g., '1234567890'
  api_secret: process.env.CLOUDINARY_API_SECRET, // e.g., 'abcdefg'
});

module.exports = cloudinary;
