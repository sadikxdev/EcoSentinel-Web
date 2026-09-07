import { useRef, useState } from "react";
import "../css/imageUpload.css";

function ImageUpload() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      setMessage("You can select maximum 10 images");
      return;
    }

    const newImages = [...images, ...files];

    const newPreviews = files.map((file) =>
      URL.createObjectURL(file),
    );

    setImages(newImages);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setMessage("");

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setMessage("");
  };

  const handleCancelAll = () => {
    previews.forEach((preview) => URL.revokeObjectURL(preview));

    setImages([]);
    setPreviews([]);
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setMessage("Please select at least one image");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(
        "http://localhost:5000/api/images/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      setMessage(data.message);

      previews.forEach((preview) => URL.revokeObjectURL(preview));

      setImages([]);
      setPreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <h2>Upload Images</h2>

      <form onSubmit={handleUpload}>
        <input
          ref={fileInputRef}
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />

        <label htmlFor="image-input" className="custom-upload-box">
          <div className="upload-icon">↑</div>

          <div className="upload-text">
            {images.length === 0 ? (
              <>
                <strong>Choose images to upload</strong>
                <span>PNG, JPG</span>
              </>
            ) : (
              <>
                <strong>
                  {images.length}{" "}
                  {images.length === 1 ? "image" : "images"} selected
                </strong>
                <span>Click here to add more images</span>
              </>
            )}
          </div>

          <div className="browse-btn">Browse Files</div>
        </label>

        {previews.length > 0 && (
          <div className="image-preview-container">
            {previews.map((preview, index) => (
              <div className="image-preview" key={preview}>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                />

                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(index)}
                  disabled={uploading}
                >
                  ×
                </button>

                <div className="image-number">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div className="upload-actions">
            <button
              type="button"
              className="cancel-upload-btn"
              onClick={handleCancelAll}
              disabled={uploading}
            >
              Cancel All
            </button>

            <button
              type="submit"
              className="upload-submit-btn"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : `Upload ${images.length} Images`}
            </button>
          </div>
        )}
      </form>

      {message && (
        <p className="upload-message">
          {message}
        </p>
      )}
    </div>
  );
}

export default ImageUpload;