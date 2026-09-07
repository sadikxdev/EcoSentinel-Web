import cloudinary from "../config/cloudinary.js";
import { uploadImageToCloudinary } from "../services/cloudinaryService.js";
import db from "../config/db.js";

export const uploadMultipleImages = async (req, res) => {
  try {
    const customerId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images were uploaded",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadImageToCloudinary(
        file.buffer,
        "general",
      );

      const dbResult = await db.query(
        `INSERT INTO images
        (customer_id, original_name, image_url, public_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
          customerId,
          file.originalname,
          result.secure_url,
          result.public_id,
        ],
      );

      uploadedImages.push(dbResult.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Multiple Image Upload Error:", error);

    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

export const getUserImages = async (req, res) => {
  try {
    const customerId = req.user.id;

    const result = await db.query(
      `SELECT id, original_name, image_url, public_id, created_at
       FROM images
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [customerId],
    );

    res.status(200).json({
      success: true,
      images: result.rows,
    });
  } catch (error) {
    console.error("Get User Images Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
};

export const deleteUserImage = async (req, res) => {
  try {
    const customerId = req.user.id;
    const imageId = req.params.id;

    const result = await db.query(
      `SELECT id, public_id
       FROM images
       WHERE id = $1 AND customer_id = $2`,
      [imageId, customerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const image = result.rows[0];

    await cloudinary.uploader.destroy(image.public_id);

    await db.query(
      `DELETE FROM images
       WHERE id = $1 AND customer_id = $2`,
      [imageId, customerId],
    );

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete Image Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};