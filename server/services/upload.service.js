const cloudinary = require("../config/init.cloudinary");
const path = require("path");

async function uploadImage(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "my_folder",
    });
    console.log("Uploaded:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

module.exports = {
  uploadImage,
};
