import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddListing() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        alert("Image is too large. Please select an image smaller than 500KB.");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    if (e) e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    // Validation
    if (!title || !price || !location || !description) {
      alert("Please fill in all fields (Title, Price, Location, Description).");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    setUploading(true);
    try {
      await addDoc(collection(db, "listings"), {
        title,
        price: numericPrice,
        location,
        count: parseInt(count),
        description,
        image, // Base64 string
        userEmail: auth.currentUser.email,
        createdAt: new Date(),
      });

      alert("Listing added!");
      setTitle("");
      setPrice("");
      setLocation("");
      setCount(1);
      setDescription("");
      setImage(null);
    } catch (error) {
      alert(error.message);
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
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Upload Image (Max 500KB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ fontSize: "14px", color: "var(--text-main)" }}
            />
            {image && (
              <div style={{ marginTop: "10px" }}>
                <img src={image} alt="Preview" style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "200px", objectFit: "cover" }} />
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
