import { useCart } from "../CartContext";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const { cart, removeFromCart, addToCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      alert("Please login to complete your purchase.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    try {
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
            {cart.map((item) => (
              <div key={item.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{item.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Price: ${item.price}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "4px" }}>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ padding: "5px 12px", border: "none", background: "none", cursor: "pointer" }}
                    >
                      −
                    </button>
                    <span style={{ padding: "0 10px", fontWeight: "bold" }}>{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      style={{ padding: "5px 12px", border: "none", background: "none", cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                  <p style={{ fontWeight: "bold", width: "80px", textAlign: "right" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
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
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: "100%", padding: "12px" }}
            >
              {loading ? "Processing..." : "Confirm Purchase"}
            </button>
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
