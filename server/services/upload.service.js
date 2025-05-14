const cloudinary = require("../config/init.cloudinary");
const path = require("path");

async function uploadImage(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "my_folder",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image with public ID: ${publicId}`);
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}

module.exports = {
  uploadImage,
  deleteImage,
};
