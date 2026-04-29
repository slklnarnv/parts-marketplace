import { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { getOptimizedUrl } from "../cloudinary";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23334155' width='400' height='300'/%3E%3Ctext x='200' y='160' text-anchor='middle' fill='%2394a3b8' font-size='60'%3E⚓%3C/text%3E%3C/svg%3E";
const ITEMS_PER_PAGE = 12;

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { addToCart, removeFromCart, getItemQuantity, updateQuantity } = useCart();
  const navigate = useNavigate();

  // Search/filter/sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStock, setFilterStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Filtered + sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
      );
    }

    // In-stock filter
    if (filterStock) {
      result = result.filter(item => item.count > 0);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "newest":
      default:
        result.sort((a, b) => {
          const da = a.createdAt?.seconds || 0;
          const db2 = b.createdAt?.seconds || 0;
          return db2 - da;
        });
        break;
    }

    return result;
  }, [items, searchQuery, sortBy, filterStock]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filterStock]);

  if (loading) return <div className="container" style={{ padding: 20 }}>Loading listings...</div>;
  if (error) return <div className="container" style={{ padding: 20, color: "var(--danger-color)" }}>{error}</div>;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "20px" }}>All Ship Parts Listings</h2>

      {/* Search + Filter Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "25px",
        alignItems: "center"
      }}>
        <div style={{ flex: "1 1 250px", position: "relative" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search parts by name, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "38px", marginBottom: 0 }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field"
          style={{ width: "auto", minWidth: "160px", marginBottom: 0 }}
        >
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="name-az">Name: A → Z</option>
        </select>
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "14px",
          color: "var(--text-muted)",
          cursor: "pointer",
          whiteSpace: "nowrap"
        }}>
          <input
            type="checkbox"
            checked={filterStock}
            onChange={(e) => setFilterStock(e.target.checked)}
            style={{ accentColor: "var(--primary-color)" }}
          />
          In Stock Only
        </label>
      </div>

      {/* Results count */}
      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
        Showing {paginatedItems.length} of {filteredItems.length} listing{filteredItems.length !== 1 ? "s" : ""}
        {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
      </p>

      {filteredItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "var(--card-bg)", borderRadius: "12px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🔍</div>
          <h3 style={{ marginBottom: "8px" }}>No listings found</h3>
          <p style={{ color: "var(--text-muted)" }}>
            {searchQuery ? "Try a different search term." : "No listings available at the moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid">
            {paginatedItems.map((item) => {
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
                    <div style={{ marginBottom: "15px", borderRadius: "8px", overflow: "hidden", height: "200px" }}>
                      <img 
                        src={item.image ? getOptimizedUrl(item.image, 600) : PLACEHOLDER_IMG} 
                        alt={item.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>
                    <h3 style={{ marginBottom: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", wordBreak: "break-word" }}>
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
                        height: "3em",
                        lineHeight: "1.5em",
                        wordBreak: "break-all"
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
                                MozAppearance: "textfield",
                                color: "var(--text-main)"
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "30px",
              flexWrap: "wrap"
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn ${page === currentPage ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "8px 14px", fontSize: "13px", minWidth: "38px" }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%" }}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>&times;</button>
            
            <div style={{ marginBottom: "20px", borderRadius: "12px", overflow: "hidden", maxHeight: "400px" }}>
              <img 
                src={selectedItem.image ? getOptimizedUrl(selectedItem.image, 1200) : PLACEHOLDER_IMG} 
                alt={selectedItem.title} 
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} 
              />
            </div>
            
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
                maxHeight: "200px",
                overflowY: "auto",
                wordBreak: "break-word"
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
