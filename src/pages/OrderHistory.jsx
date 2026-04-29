import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { getUserOrders } from "../services/transactionService";
import { addReview } from "../services/reviewService";
import { Link } from "react-router-dom";
import { useToast } from "../ToastContext";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserOrders(user.email);
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await addReview({
        buyerEmail: auth.currentUser.email,
        sellerEmail: reviewOrder.sellerEmail,
        transactionId: reviewOrder.id,
        rating,
        comment
      });
      toast.success("Review submitted!");
      setReviewOrder(null);
      setRating(5);
      setComment("");
    } catch (err) {
      toast.error("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "#fb923c"; // orange
      case "Shipped": return "#3b82f6"; // blue
      case "Delivered": return "#10b981"; // green
      case "Cancelled": return "#ef4444"; // red
      default: return "#64748b"; // gray
    }
  };

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
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "5px", display: "flex", alignItems: "center", gap: "10px" }}>
                    {order.itemTitle}
                    <span style={{
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      color: "#fff",
                      backgroundColor: getStatusColor(order.status || "Pending")
                    }}>
                      {order.status || "Pending"}
                    </span>
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "5px" }}>
                    Seller: {order.sellerEmail}
                  </p>
                  {(order.status === "Delivered") && (
                     <button onClick={() => setReviewOrder(order)} className="btn btn-outline" style={{ padding: "4px 8px", fontSize: "0.8rem", marginTop: "5px", border: "1px solid var(--primary-color)", color: "var(--primary-color)", background: "transparent", cursor: "pointer", borderRadius: "4px" }}>
                       Rate Seller
                     </button>
                  )}
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

      {/* Review Modal */}
      {reviewOrder && (
        <div className="modal-overlay" onClick={() => setReviewOrder(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <h3 style={{ marginBottom: "15px" }}>Rate Seller</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "0.9rem" }}>
              How was your experience buying "{reviewOrder.itemTitle}" from {reviewOrder.sellerEmail}?
            </p>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input-field">
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Comment (Optional)</label>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  className="input-field" 
                  rows="3"
                  placeholder="Share details of your experience..."
                ></textarea>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReviewOrder(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
