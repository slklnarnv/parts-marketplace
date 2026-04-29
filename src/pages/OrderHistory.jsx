import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "transactions"),
          where("buyerEmail", "==", user.email),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(data);
      } catch (err) {
        console.error("Error fetching order history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="container" style={{ padding: 20 }}>Loading your orders...</div>;

  if (error) {
    return (
      <div className="container" style={{ padding: "40px 20px" }}>
        <div className="card" style={{ borderLeft: "4px solid var(--danger-color)" }}>
          <h3>Query Error</h3>
          <p style={{ color: "var(--text-muted)" }}>{error}</p>
          <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
            <strong>Note:</strong> If the error says "The query requires an index", please check your browser console (F12) for a direct link to create it in Firebase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "30px" }}>Order History</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "var(--card-bg)", borderRadius: "12px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "15px" }}>📦</div>
          <h3 style={{ marginBottom: "8px" }}>No orders yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>When you purchase parts, they'll show up here.</p>
          <Link to="/listings" className="btn btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="order-header-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "15px" }}>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Order ID:</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "500", marginLeft: "5px" }}>{order.id}</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {order.timestamp?.toDate().toLocaleString()}
                </div>
              </div>
              
              <div className="order-details-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{order.itemTitle}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Seller: {order.sellerEmail}
                  </p>
                </div>
                <div className="order-price-col" style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.9rem", margin: 0 }}>
                    Qty: <strong>{order.quantity || 1}</strong> × ${order.priceAtPurchase}
                  </p>
                  <p style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--primary-color)", marginTop: "5px" }}>
                    Total: ${order.totalPrice || (order.priceAtPurchase * (order.quantity || 1))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
