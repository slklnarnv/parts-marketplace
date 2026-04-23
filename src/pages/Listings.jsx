import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { useCart } from "../CartContext";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
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
                  <div style={{ width: "100%" }}>
                    {getItemQuantity(item.id) > 0 ? (
                      <div className="btn" style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        padding: "0 15px",
                        backgroundColor: "var(--primary-color)",
                        color: "white",
                        cursor: "default"
                      }}>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: "none", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer", padding: "10px" }}
                        >
                          −
                        </button>
                        <span style={{ fontWeight: "bold" }}>{getItemQuantity(item.id)}</span>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <button 
                            onClick={() => addToCart(item)}
                            disabled={getItemQuantity(item.id) >= item.count}
                            style={{ background: "none", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer", padding: "10px" }}
                          >
                            +
                          </button>
                          <button 
                            onClick={() => navigate("/cart")}
                            style={{ 
                              background: "rgba(255,255,255,0.15)", 
                              border: "none", 
                              color: "white", 
                              cursor: "pointer", 
                              padding: "10px 12px", 
                              marginLeft: "8px", 
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              transition: "background 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                            title="Go to Cart"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.count <= 0}
                        className={`btn ${item.count <= 0 ? "btn-secondary" : "btn-primary"}`}
                        style={{ width: "100%" }}
                      >
                        {item.count <= 0 ? "Out of Stock" : "Buy Now"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
