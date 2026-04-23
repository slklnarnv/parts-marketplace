import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Added for navigation

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigation hook

  const fetchListings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "listings"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    } catch (err) {
      setError("Failed to fetch listings. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleBuy = async (item) => {
    // 1. Check if user is logged in
    if (!auth.currentUser) {
      alert("You must be logged in to buy ship parts!");
      return;
    }

    // 2. Check if item is in stock
    if (item.count <= 0) {
      alert("Sorry, this item is out of stock.");
      return;
    }

    const itemRef = doc(db, "listings", item.id);

    try {
      // 3. Update the stock count in the listings collection
      await updateDoc(itemRef, {
        count: item.count - 1,
      });

      // 4. Create a transaction record in the 'transactions' ledger
      await addDoc(collection(db, "transactions"), {
        itemId: item.id,
        itemTitle: item.title,
        buyerEmail: auth.currentUser.email,
        priceAtPurchase: item.price,
        sellerEmail: item.userEmail || "Unknown",
        timestamp: new Date(),
      });

      alert("Purchase successful! Transaction recorded in ledger.");
      fetchListings();
    } catch (err) {
      console.error("Error processing purchase: ", err);
      alert("Error completing purchase.");
    }
  };

  if (loading) return <div className="container" style={{ padding: 20 }}>Loading listings...</div>;
  if (error) return <div className="container" style={{ padding: 20, color: "var(--danger-color)" }}>{error}</div>;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "30px" }}>All Ship Parts Listings</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No listings available at the moment.</p>
      ) : (
        <div className="grid">
          {items.map((item) => {
            const isOwner = auth.currentUser?.email === item.userEmail;

            return (
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
                      <span style={{ color: "var(--text-muted)", width: "100px", display: "inline-block" }}>📍 Location:</span>
                      {item.location}
                    </p>
                    <p style={{ margin: "8px 0" }}>
                      <span style={{ color: "var(--text-muted)", width: "100px", display: "inline-block" }}>🛒 Stock:</span>
                      {item.count} items
                    </p>
                  </div>
                </div>

                {isOwner ? (
                  <button
                    onClick={() => navigate(`/edit/${item.id}`)}
                    className="btn btn-secondary"
                    style={{ width: "100%" }}
                  >
                    Edit My Listing
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={item.count <= 0}
                    className={`btn ${item.count <= 0 ? "btn-secondary" : "btn-primary"}`}
                    style={{ width: "100%" }}
                  >
                    {item.count <= 0 ? "Out of Stock" : "Buy Now"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
