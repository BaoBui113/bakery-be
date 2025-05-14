const { uploadImage, deleteImage } = require("../services/upload.service");
const fs = require("fs");
const uploadController = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get the file path
    const filePath = req.file.path; // local path: ./uploads/...
    const { url, publicId } = await uploadImage(filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });

    return res.status(200).json({
      message: "Image uploaded successfully",
      url,
      publicId,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Error uploading image" });
  }
};
const deleteImageController = async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    return res.status(400).json({ message: "publicId là bắt buộc." });
  }

  try {
    // Xóa ảnh trên Cloudinary
    await deleteImage(publicId);

    return res.status(200).json({ message: "Xóa ảnh thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    return res.status(500).json({ message: "Xóa ảnh thất bại.", error });
  }
};
module.exports = {
  uploadController,
  deleteImageController,
};
