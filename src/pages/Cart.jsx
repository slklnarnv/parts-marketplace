import { useCart } from "../CartContext";
import { auth } from "../firebase";
import { createTransaction } from "../services/transactionService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "../ToastContext";
import { getOptimizedUrl } from "../cloudinary";

export default function Cart() {
  const { cart, removeFromCart, addToCart, clearCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const hasOwnItems = auth.currentUser && cart.some(item => item.userEmail === auth.currentUser.email);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      toast.warning("Please login to complete your purchase.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return;

    setShowConfirm(false);
    setLoading(true);
    try {
      // Check if user is trying to buy their own items
      const ownItems = cart.filter(item => item.userEmail === auth.currentUser.email);
      if (ownItems.length > 0) {
        throw new Error(`You cannot purchase your own listings (${ownItems.map(i => i.title).join(", ")}). Please remove them from your cart.`);
      }

      await createTransaction(cart, auth.currentUser.email);

      toast.success("Purchase successful! Your orders have been placed.");
      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px", color: "var(--text-main)" }}>
      <h2 style={{ marginBottom: "30px" }}>My Shopping Cart</h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "var(--card-bg)", borderRadius: "12px", color: "var(--text-main)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "15px" }}>🛒</div>
          <h3 style={{ marginBottom: "8px" }}>Your cart is empty</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>Looks like you haven't added any parts yet.</p>
          <button onClick={() => navigate("/listings")} className="btn btn-primary">
            Browse Listings
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {cart.map((item) => {
              const isOwnItem = auth.currentUser?.email === item.userEmail;

              return (
                <div key={item.id} className="card cart-item" style={{
                  border: isOwnItem ? "1px solid var(--danger-color)" : "1px solid var(--border-color)",
                  position: "relative"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    {/* Thumbnail */}
                    <div style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "var(--bg-color)"
                    }}>
                      <img
                        src={item.image ? getOptimizedUrl(item.image, 120) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23334155' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2394a3b8' font-size='40'%3E⚓%3C/text%3E%3C/svg%3E"}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{item.title}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Price: ${item.price}</p>
                      {isOwnItem && (
                        <p style={{ color: "var(--danger-color)", fontSize: "0.8rem", fontWeight: "bold", marginTop: "5px" }}>
                          ⚠️ You cannot buy your own item
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      overflow: "hidden"
                    }}>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        style={{
                          width: "50px",
                          border: "none",
                          background: "none",
                          color: "var(--text-main)",
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
                            padding: "8px 12px",
                            border: "none",
                            borderRight: "1px solid var(--border-color)",
                            background: "none",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            fontSize: "1.2rem",
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
                          disabled={item.quantity >= item.count}
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            fontSize: "1.2rem",
                            opacity: item.quantity >= item.count ? 0.5 : 1,
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
                    <p style={{ fontWeight: "bold", width: "80px", textAlign: "right" }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ height: "fit-content" }}>
            <h3 style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              Order Summary
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span>Items ({cart.reduce((t, i) => t + i.quantity, 0)})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", fontSize: "1.2rem", fontWeight: "bold" }}>
              <span>Total</span>
              <span style={{ color: "var(--primary-color)" }}>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={loading || hasOwnItems}
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
            >
              {loading ? "Processing..." : hasOwnItems ? "Remove Own Items to Continue" : "Confirm Purchase"}
            </button>
            {hasOwnItems && (
              <p style={{ color: "var(--danger-color)", fontSize: "0.85rem", textAlign: "center", marginTop: "10px" }}>
                You have items in your cart that belong to you.
              </p>
            )}
            <button
              onClick={() => navigate("/listings")}
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: "10px" }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px", textAlign: "center" }}>
            <h3 style={{ marginBottom: "15px" }}>Confirm Purchase</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "8px" }}>
              You are about to purchase <strong>{cart.reduce((t, i) => t + i.quantity, 0)} item(s)</strong>
            </p>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)", marginBottom: "25px" }}>
              Total: ${totalPrice.toFixed(2)}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCheckout}>
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
