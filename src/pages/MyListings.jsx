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

  if (loading) return <div>Loading your listings...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Listings</h2>
      {items.map((item) => (
        <div
          key={item.id}
          style={{ border: "1px solid gray", margin: 10, padding: 10 }}
        >
          <h3>{item.title}</h3>
          <p>
            💰 Price: ${item.price} | 🛒 Stock: {item.count}
          </p>
          <button onClick={() => navigate(`/edit/${item.id}`)}>Edit</button>
          <button
            onClick={() => handleDelete(item.id)}
            style={{ marginLeft: 10, color: "red" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
