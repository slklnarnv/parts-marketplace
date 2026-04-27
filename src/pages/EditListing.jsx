import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const docSnap = await getDoc(doc(db, "listings", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userEmail !== auth.currentUser?.email) {
          alert("Not authorized");
          navigate("/listings");
          return;
        }
        setTitle(data.title);
        setPrice(data.price);
        setLocation(data.location);
        setCount(data.count);
        setDescription(data.description || "");
        setImage(data.image || null);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id, navigate]);

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

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setUpdating(true);
    try {
      await updateDoc(doc(db, "listings", id), {
        title,
        price: parseFloat(price),
        location,
        count: parseInt(count),
        description,
        image,
      });
      alert("Updated!");
      navigate("/my-listings");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "30px" }}>Edit Listing</h2>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Part Name</label>
            <input
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
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Quantity</label>
              <input
                type="number"
                min="0"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Location</label>
            <input
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
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Change Image (Max 500KB)</label>
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
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
