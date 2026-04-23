import { useCart } from "../CartContext";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const { cart, removeFromCart, addToCart, clearCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const hasOwnItems = auth.currentUser && cart.some(item => item.userEmail === auth.currentUser.email);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      alert("Please login to complete your purchase.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    try {
      // 1. Check if user is trying to buy their own items
      const ownItems = cart.filter(item => item.userEmail === auth.currentUser.email);
      if (ownItems.length > 0) {
        throw new Error(`You cannot purchase your own listings (${ownItems.map(i => i.title).join(", ")}). Please remove them from your cart.`);
      }

      for (const item of cart) {
        // Double check stock before processing
        const itemRef = doc(db, "listings", item.id);
        const itemSnap = await getDoc(itemRef);
        
        if (!itemSnap.exists()) {
          throw new Error(`Item ${item.title} no longer exists.`);
        }
        
        const currentStock = itemSnap.data().count;
        if (currentStock < item.quantity) {
          throw new Error(`Not enough stock for ${item.title}. Only ${currentStock} left.`);
        }

        // 1. Update stock
        await updateDoc(itemRef, {
          count: currentStock - item.quantity,
        });

        // 2. Record transaction
        await addDoc(collection(db, "transactions"), {
          itemId: item.id,
          itemTitle: item.title,
          buyerEmail: auth.currentUser.email,
          priceAtPurchase: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          sellerEmail: item.userEmail || "Unknown",
          timestamp: new Date(),
        });
      }

      alert("Purchase successful! Your orders have been placed.");
      clearCart();
      navigate("/listings");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error during checkout: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h2 style={{ marginBottom: "30px" }}>My Shopping Cart</h2>
      
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "8px" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Your cart is empty.</p>
          <button onClick={() => navigate("/listings")} className="btn btn-primary">
            Browse Listings
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {cart.map((item) => {
              const isOwnItem = auth.currentUser?.email === item.userEmail;
              
              return (
                <div key={item.id} className="card" style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  border: isOwnItem ? "1px solid var(--danger-color)" : "1px solid var(--border-color)",
                  position: "relative"
                }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{item.title}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Price: ${item.price}</p>
                    {isOwnItem && (
                      <p style={{ color: "var(--danger-color)", fontSize: "0.8rem", fontWeight: "bold", marginTop: "5px" }}>
                        ⚠️ You cannot buy your own item
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    backgroundColor: "white",
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
              onClick={handleCheckout} 
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
    </div>
  );
}
