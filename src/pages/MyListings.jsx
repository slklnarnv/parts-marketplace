import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserListings, deleteListing } from "../services/listingService";
import { getSellerSales, updateTransactionStatus } from "../services/transactionService";
import { useNavigate } from "react-router-dom";
import { getOptimizedUrl } from "../cloudinary";
import { useToast } from "../ToastContext";
import SkeletonLoader from "../SkeletonLoader";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const { toast } = useToast();
  const [salesData, setSalesData] = useState({});
  const [globalStats, setGlobalStats] = useState({ totalRevenue: 0, totalItemsSold: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const navigate = useNavigate();

  const fetchListingsAndStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const listingsData = await getUserListings(user.email);
      setItems(listingsData);

      const transData = await getSellerSales(user.email);
      setSales(transData);
      
      const stats = {};
      let totalRevenue = 0;
      let totalItemsSold = 0;

      transData.forEach((data) => {
        const itemId = data.itemId;
        const qty = data.quantity || 1;
        const revenue = data.totalPrice || (data.priceAtPurchase * qty);

        if (!stats[itemId]) {
          stats[itemId] = { sold: 0, revenue: 0 };
        }
        stats[itemId].sold += qty;
        stats[itemId].revenue += revenue;

        totalRevenue += revenue;
        totalItemsSold += qty;
      });

      setSalesData(stats);
      setGlobalStats({ totalRevenue, totalItemsSold });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingsAndStats();
  }, []);

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await deleteListing(itemId);
        setItems(items.filter((item) => item.id !== itemId));
        toast.success("Listing deleted.");
      } catch (err) {
        toast.error("Delete failed.");
      }
    }
  };

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await updateTransactionStatus(saleId, newStatus);
      setSales(sales.map(s => s.id === saleId ? { ...s, status: newStatus } : s));
      toast.success("Order status updated!");
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Your Dashboard</h2>
      <SkeletonLoader />
    </div>
  );

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="my-listings-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
        <h2 style={{ margin: 0 }}>Your Listings</h2>
        <div className="my-listings-stats" style={{ display: "flex", gap: "20px" }}>
          <div className="card" style={{ padding: "10px 20px", textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Sales</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary-color)" }}>{globalStats.totalItemsSold}</div>
          </div>
          <div className="card" style={{ padding: "10px 20px", textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Revenue</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--success-color)" }}>${globalStats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
        <button 
          className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab("listings")}
        >
          My Inventory
        </button>
        <button 
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab("sales")}
        >
          Fulfillment ({sales.filter(s => s.status === 'Pending' || !s.status).length} Pending)
        </button>
      </div>

      {activeTab === "listings" ? (
      items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>You haven't posted any listings yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {items.map((item) => {
            const stats = salesData[item.id] || { sold: 0, revenue: 0 };
            
            return (
              <div key={item.id} className="card my-listing-card" style={{ 
                position: "relative", 
                display: "flex", 
                gap: "32px", 
                alignItems: "stretch",
                padding: "24px",
                minHeight: "180px"
              }}>
                {item.image && (
                  <div className="listing-image" style={{ width: "200px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    <img 
                      src={getOptimizedUrl(item.image, 400)} 
                      alt={item.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>
                )}
                
                <div className="listing-content" style={{ flexGrow: 1, paddingRight: "120px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{item.title}</h3>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      padding: "2px 8px", 
                      backgroundColor: "rgba(0,0,0,0.05)", 
                      borderRadius: "6px", 
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      letterSpacing: "0.5px"
                    }}>
                      #{item.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "24px", marginBottom: "20px", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>💰</span>
                      <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>${item.price}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>📍</span>
                      <span style={{ color: "var(--text-muted)", fontWeight: "550" }}>{item.location}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1.1rem" }}>🛒</span>
                      <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>{item.count} in stock</span>
                    </div>
                  </div>

                  <div style={{ 
                    display: "inline-flex", 
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                  }}>
                    <div style={{ backgroundColor: "var(--card-bg)", padding: "8px 20px", display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-color)" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "700", marginBottom: "2px" }}>Sold</span>
                      <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--primary-color)" }}>{stats.sold}</span>
                    </div>
                    <div style={{ backgroundColor: "var(--card-bg)", padding: "8px 20px", display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "700", marginBottom: "2px" }}>Revenue</span>
                      <span style={{ fontWeight: "650", fontSize: "1.1rem", color: "var(--success-color)" }}>${stats.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="my-listing-actions" style={{ 
                  position: "absolute", 
                  right: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "10px",
                  top: "50%",
                  transform: "translateY(-50%)"
                }}>
                  {/* Edit button */}
                  <button 
                    onClick={() => navigate(`/edit/${item.id}`)} 
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--card-bg)",
                      color: "var(--primary-color)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      whiteSpace: "nowrap"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = "var(--primary-color)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.35)";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = "var(--card-bg)";
                      e.currentTarget.style.color = "var(--primary-color)";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--card-bg)",
                      color: "var(--danger-color)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      whiteSpace: "nowrap"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = "var(--danger-color)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.35)";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = "var(--card-bg)";
                      e.currentTarget.style.color = "var(--danger-color)";
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )
      ) : (
        /* Fulfillment Tab */
        sales.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>You haven't made any sales yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {sales.map((sale) => (
              <div key={sale.id} className="card">
                <div className="order-header-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "15px" }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Order ID:</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "500", marginLeft: "5px" }}>{sale.id}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {sale.timestamp?.toDate().toLocaleString()}
                  </div>
                </div>
                
                <div className="order-details-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{sale.itemTitle}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "10px" }}>
                      Buyer: {sale.buyerEmail}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>Status:</span>
                      <select 
                        value={sale.status || "Pending"} 
                        onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                        className="input-field"
                        style={{ width: "auto", margin: 0, padding: "5px 10px" }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="order-price-col" style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.9rem", margin: 0 }}>
                      Qty: <strong>{sale.quantity || 1}</strong> × ${sale.priceAtPurchase}
                    </p>
                    <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--success-color)", marginTop: "5px" }}>
                      Revenue: ${sale.totalPrice || (sale.priceAtPurchase * (sale.quantity || 1))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
