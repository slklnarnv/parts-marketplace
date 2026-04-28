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
import { getOptimizedUrl } from "../cloudinary";

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [globalStats, setGlobalStats] = useState({ totalRevenue: 0, totalItemsSold: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchListingsAndStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // 1. Fetch listings
      const q = query(
        collection(db, "listings"),
        where("userEmail", "==", user.email)
      );
      const snapshot = await getDocs(q);
      const listingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(listingsData);

      // 2. Fetch transactions where this user is the seller
      const transQ = query(
        collection(db, "transactions"),
        where("sellerEmail", "==", user.email)
      );
      const transSnapshot = await getDocs(transQ);
      
      const stats = {};
      let totalRevenue = 0;
      let totalItemsSold = 0;

      transSnapshot.docs.forEach((doc) => {
        const data = doc.data();
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
        <h2 style={{ margin: 0 }}>Your Listings</h2>
        <div style={{ display: "flex", gap: "20px" }}>
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

      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>You haven't posted any listings yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {items.map((item) => {
            const stats = salesData[item.id] || { sold: 0, revenue: 0 };
            
            return (
              <div key={item.id} className="card" style={{ 
                position: "relative", 
                display: "flex", 
                gap: "32px", 
                alignItems: "stretch",
                padding: "24px",
                minHeight: "180px"
              }}>
                {item.image && (
                  <div style={{ width: "200px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    <img 
                      src={getOptimizedUrl(item.image, 400)} 
                      alt={item.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>
                )}
                
                <div style={{ flexGrow: 1, paddingRight: "120px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
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

                <div style={{ 
                  position: "absolute", 
                  right: "24px", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "8px" 
                }}>
                  <button 
                    onClick={() => navigate(`/edit/${item.id}`)} 
                    className="btn btn-secondary"
                    style={{ padding: "6px 15px", fontSize: "13px", minWidth: "80px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-danger"
                    style={{ padding: "6px 15px", fontSize: "13px", minWidth: "80px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
