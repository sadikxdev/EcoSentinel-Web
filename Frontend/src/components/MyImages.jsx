import { useEffect, useState } from "react";
import "../css/myImages.css";

function MyImages() {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const getImages = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/images/my-images",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch images");
        }

        setImages(data.images);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    getImages();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/images/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete image");
      }

      setImages((prevImages) =>
        prevImages.filter((image) => image.id !== id)
      );

      setMessage(data.message || "Image deleted successfully");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p>Loading images...</p>;
  }

  return (
    <div className="my-images">
      <h2>My Uploaded Images</h2>

      {message && <p>{message}</p>}

      {images.length === 0 ? (
        <p>No images uploaded yet.</p>
      ) : (
        <div className="images-row">
          {images.map((image) => (
            <div className="image-card" key={image.id}>
              <img
                src={image.image_url}
                alt={image.original_name}
              />

              <button
                className="delete-btn"
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
              >
                {deletingId === image.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyImages;