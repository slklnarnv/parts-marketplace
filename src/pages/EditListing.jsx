import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { uploadImageToCloudinary, getOptimizedUrl } from "../cloudinary";
import { useToast } from "../ToastContext";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchListing = async () => {
      const docSnap = await getDoc(doc(db, "listings", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userEmail !== auth.currentUser?.email) {
          toast.error("Not authorized");
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
      if (file.size > 5000000) { // Increased to 5MB
        toast.warning("Image is too large. Please select an image smaller than 5MB.");
        e.target.value = null;
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // For preview
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

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setUpdating(true);
    try {
      let imageUrl = image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      await updateDoc(doc(db, "listings", id), {
        title,
        price: parseFloat(price),
        location,
        count: parseInt(count),
        description,
        image: imageUrl,
      });
      toast.success("Listing updated!");
      navigate("/my-listings");
    } catch (err) {
      toast.error("Update failed.");
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

          <div className="form-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>Change Image (Max 5MB)</label>
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
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
