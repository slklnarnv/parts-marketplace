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
  const [loading, setLoading] = useState(true);

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
      }
      setLoading(false);
    };
    fetchListing();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      await updateDoc(doc(db, "listings", id), {
        title,
        price: parseFloat(price),
        location,
        count: parseInt(count),
      });
      alert("Updated!");
      navigate("/my-listings");
    } catch (err) {
      alert("Update failed.");
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              Save Changes
            </button>
            <button type="button" onClick={() => navigate("/my-listings")} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
