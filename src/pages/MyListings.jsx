import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchListings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "listings"),
        where("userEmail", "==", user.email) // Filter for current user
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await deleteDoc(doc(db, "listings", itemId));
        setItems(items.filter((item) => item.id !== itemId));
        alert("Deleted!");
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  if (loading) return <div className="container" style={{ padding: 20 }}>Loading your listings...</div>;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "30px" }}>Your Listings</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>You haven't posted any listings yet.</p>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ marginBottom: "15px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                  {item.title}
                </h3>
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ margin: "8px 0" }}>
                    <span style={{ color: "var(--text-muted)", width: "100px", display: "inline-block" }}>💰 Price:</span>
                    <strong>${item.price}</strong>
                  </p>
                  <p style={{ margin: "8px 0" }}>
                    <span style={{ color: "var(--text-muted)", width: "100px", display: "inline-block" }}>🛒 Stock:</span>
                    {item.count} items
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => navigate(`/edit/${item.id}`)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
