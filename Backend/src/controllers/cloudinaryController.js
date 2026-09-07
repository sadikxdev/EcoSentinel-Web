import cloudinary from "../config/cloudinary.js";

const testCloudinary = async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      resource_type: "image",
      max_results: 1,
    });

    res.json({
      success: true,
      message: "Cloudinary connected successfully",
      resources: result.resources,
    });
  } catch (error) {
    console.error("Cloudinary Error:", error);

    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
    });
  }
};

export default testCloudinary;