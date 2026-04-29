import { useState, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadImageToCloudinary, getOptimizedUrl } from "../cloudinary";
import { useToast } from "../ToastContext";

export default function AddListing() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // Increased to 5MB
        toast.warning("Image is too large. Please select an image smaller than 5MB.");
        e.target.value = null;
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // For preview only
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdd = async (e) => {
    if (e) e.preventDefault();
    if (!auth.currentUser) {
      toast.warning("Please login first.");
      return;
    }

    // Validation
    if (!title || !price || !location || !description) {
      toast.warning("Please fill in all fields (Title, Price, Location, Description).");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.warning("Please enter a valid price.");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await addDoc(collection(db, "listings"), {
        title,
        price: numericPrice,
        location,
        count: parseInt(count),
        description,
        image: imageUrl, // Now storing Cloudinary URL
        userEmail: auth.currentUser.email,
        createdAt: new Date(),
      });

      toast.success("Listing added!");
      setTitle("");
      setPrice("");
      setLocation("");
      setCount(1);
      setDescription("");
      handleRemoveImage();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "30px" }}>Add Ship Part</h2>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Part Name</label>
            <input
              placeholder="e.g. Caterpillar 3512 Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <div className="form-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Price ($)</label>
              <input
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.01"
                className="input-field"
                required
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Quantity</label>
              <input
                placeholder="1"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                type="number"
                min="1"
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Location</label>
            <input
              placeholder="e.g. Port of Singapore"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Description</label>
            <textarea
              placeholder="Provide detailed information about the part..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              style={{ minHeight: "100px", resize: "vertical" }}
              required
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Upload Image (Max 5MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ fontSize: "14px", color: "var(--text-main)" }}
            />
            {image && (
              <div style={{ marginTop: "15px", position: "relative", display: "inline-block" }}>
                <img
                  src={getOptimizedUrl(image, 600)}
                  alt="Preview"
                  style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "200px", objectFit: "cover", display: "block" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{ 
                    position: "absolute", 
                    top: "-10px", 
                    right: "-10px", 
                    width: "24px", 
                    height: "24px", 
                    borderRadius: "50%", 
                    backgroundColor: "var(--danger-color)", 
                    color: "white", 
                    border: "2px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    fontSize: "18px",
                    fontWeight: "bold",
                    lineHeight: "0",
                    padding: "0",
                    paddingBottom: "2px",
                  }}
                  title="Remove image"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "12px" }}
            disabled={uploading}
          >
            {uploading ? "Adding Listing..." : "Add Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
