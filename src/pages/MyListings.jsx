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
        <div className="grid">
          {items.map((item) => {
            const stats = salesData[item.id] || { sold: 0, revenue: 0 };
            
            return (
              <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {item.image && (
                  <div style={{ borderRadius: "8px", overflow: "hidden", height: "150px" }}>
                    <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: "0 0 15px 0" }}>{item.title}</h3>
                  <div style={{ marginBottom: "0px" }}>
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
                    <div style={{ 
                      marginTop: "15px", 
                      padding: "12px", 
                      backgroundColor: "var(--bg-color)", 
                      borderRadius: "6px",
                      border: "1px dashed var(--border-color)"
                    }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "var(--secondary-color)" }}>
                        Item Analytics
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                        <span>Sold:</span>
                        <span style={{ fontWeight: "bold" }}>{stats.sold}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginTop: "4px" }}>
                        <span>Revenue:</span>
                        <span style={{ fontWeight: "bold", color: "var(--success-color)" }}>${stats.revenue.toFixed(2)}</span>
                      </div>
                    </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
