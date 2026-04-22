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

  if (loading) return <div>Loading listings...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>All Ship Parts Listings</h2>
      {items.length === 0 ? (
        <p>No listings available at the moment.</p>
      ) : (
        items.map((item) => {
          // Check if the current user is the owner of this specific listing
          const isOwner = auth.currentUser?.email === item.userEmail;

          return (
            <div
              key={item.id}
              style={{ border: "1px solid gray", margin: 10, padding: 10 }}
            >
              <h3>{item.title}</h3>
              <p>💰 Price: ${item.price}</p>
              <p>📍 Location: {item.location}</p>
              <p>🛒 Available: {item.count} items</p>

              {isOwner ? (
                /* Show Edit button if user is the owner */
                <button
                  onClick={() => navigate(`/edit/${item.id}`)}
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit My Listing
                </button>
              ) : (
                /* Show Buy button if user is NOT the owner */
                <button
                  onClick={() => handleBuy(item)}
                  disabled={item.count <= 0}
                  style={{
                    backgroundColor: item.count <= 0 ? "gray" : "blue",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: item.count <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {item.count <= 0 ? "Out of Stock" : "Buy"}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
