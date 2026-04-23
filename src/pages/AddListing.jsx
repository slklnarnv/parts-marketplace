import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddListing() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);

  const handleAdd = async (e) => {
    if (e) e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    // Validation
    if (!title || !price || !location) {
      alert("Please fill in all fields.");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      await addDoc(collection(db, "listings"), {
        title,
        price: numericPrice,
        location,
        count: parseInt(count),
        userEmail: auth.currentUser.email,
        createdAt: new Date(),
      });

      alert("Listing added!");
      setTitle("");
      setPrice("");
      setLocation("");
      setCount(1);
    } catch (error) {
      alert(error.message);
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

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Post Listing
          </button>
        </form>
      </div>
    </div>
  );
}
