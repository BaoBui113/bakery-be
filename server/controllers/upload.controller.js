const { uploadImage } = require("../services/upload.service");

const uploadController = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the file path
    const filePath = req.file.path;

    // Upload the image to Cloudinary
    const result = await uploadImage(filePath);

    // Send the response with the uploaded image URL
    return res.status(200).json({
      message: "Image uploaded successfully",
      url: result,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Error uploading image" });
  }
};
module.exports = {
  uploadController,
};
