import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { useCart } from "../CartContext";

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { addToCart, removeFromCart, getItemQuantity, updateQuantity } = useCart();
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
              <div 
                key={item.id} 
                className="card" 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  cursor: "pointer"
                }}
                onClick={() => setSelectedItem(item)}
              >
                <div>
                  {item.image && (
                    <div style={{ marginBottom: "15px", borderRadius: "8px", overflow: "hidden", height: "200px" }}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>
                  )}
                  <h3 style={{ marginBottom: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                    {item.title}
                  </h3>
                  <div style={{ marginBottom: "15px" }}>
                    <p style={{ 
                      margin: "4px 0", 
                      fontSize: "14px", 
                      color: "var(--text-main)", 
                      display: "-webkit-box", 
                      WebkitLineClamp: "3", 
                      WebkitBoxOrient: "vertical", 
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "3em", /* Added fixed height for uniform look */
                      lineHeight: "1.5em" /* Ensure consistent line height */
                    }}>
                      {item.description}
                    </p>
                  </div>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit/${item.id}`);
                    }}
                    className="btn btn-secondary"
                    style={{ width: "100%" }}
                  >
                    Edit My Listing
                  </button>
                ) : (
                  <div style={{ width: "100%" }} onClick={(e) => e.stopPropagation()}>
                    {getItemQuantity(item.id) > 0 ? (
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        width: "100%"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center",
                          backgroundColor: "var(--card-bg)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flex: 1
                        }}>
                          <input
                            type="number"
                            value={getItemQuantity(item.id)}
                            onChange={(e) => updateQuantity(item, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "none",
                              textAlign: "center",
                              fontWeight: "600",
                              fontSize: "0.95rem",
                              padding: "8px 0",
                              outline: "none",
                              appearance: "textfield",
                              MozAppearance: "textfield"
                            }}
                          />
                          <div style={{ 
                            display: "flex", 
                            borderLeft: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-color)"
                          }}>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              style={{ 
                                background: "none", 
                                border: "none", 
                                borderRight: "1px solid var(--border-color)",
                                color: "var(--text-main)", 
                                fontSize: "1.2rem", 
                                cursor: "pointer", 
                                padding: "8px 12px",
                                display: "flex",
                                alignItems: "center",
                                transition: "background 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              −
                            </button>
                            <button 
                              onClick={() => addToCart(item)}
                              disabled={getItemQuantity(item.id) >= item.count}
                              style={{ 
                                background: "none", 
                                border: "none", 
                                color: "var(--text-main)", 
                                fontSize: "1.2rem", 
                                cursor: "pointer", 
                                padding: "8px 12px",
                                opacity: getItemQuantity(item.id) >= item.count ? 0.5 : 1,
                                display: "flex",
                                alignItems: "center",
                                transition: "background 0.2s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/cart");
                          }}
                          className="btn btn-primary"
                          style={{ 
                            padding: "10px", 
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          title="Go to Cart"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
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

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>×</button>
            
            {selectedItem.image && (
              <div style={{ marginBottom: "25px", borderRadius: "12px", overflow: "hidden", maxHeight: "400px" }}>
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#f0f0f0" }} 
                />
              </div>
            )}
            
            <h2 style={{ marginBottom: "20px", borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px" }}>
              {selectedItem.title}
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
              <div className="card" style={{ padding: "15px" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.9rem" }}>Price</span>
                <strong style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}>${selectedItem.price}</strong>
              </div>
              <div className="card" style={{ padding: "15px" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.9rem" }}>Location</span>
                <strong style={{ fontSize: "1.1rem" }}>{selectedItem.location}</strong>
              </div>
              <div className="card" style={{ padding: "15px" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.9rem" }}>Stock</span>
                <strong style={{ fontSize: "1.1rem" }}>{selectedItem.count} items</strong>
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ marginBottom: "10px", color: "var(--text-main)" }}>Description</h4>
              <p style={{ 
                lineHeight: "1.8", 
                color: "var(--text-main)", 
                whiteSpace: "pre-wrap",
                backgroundColor: "var(--bg-color)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                maxHeight: "200px", /* Fixed height to prevent overflow */
                overflowY: "auto", /* Make it scrollable */
                wordBreak: "break-word" /* Ensure long words wrap */
              }}>
                {selectedItem.description || "No description provided."}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
                Close
              </button>
              {auth.currentUser?.email !== selectedItem.userEmail && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    addToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
