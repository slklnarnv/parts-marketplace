import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./useAuth"; // Importing the centralized auth hook
import { useCart } from "./CartContext";

export default function Navbar() {
  const { user, isAdmin, loading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <nav className="navbar">
        <div className="container navbar-content">
          <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary-color)" }}>
            🚢 MarineParts
          </div>
          <div className="navbar-links" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Connecting...
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary-color)" }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>🚢 MarineParts</Link>
        </div>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/listings">Listings</Link>
          <Link to="/cart" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            My Cart {cartCount > 0 && (
              <span style={{ 
                backgroundColor: "var(--primary-color)", 
                color: "white", 
                borderRadius: "50%", 
                padding: "2px 8px", 
                fontSize: "0.8rem",
                marginLeft: "4px"
              }}>
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/add">Add Listing</Link>
              <Link to="/my-listings">My Listings</Link>
              <Link to="/orders">Order History</Link>
              {isAdmin && (
                <Link to="/admin" style={{ color: "var(--primary-color)" }}>
                  Admin
                </Link>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "10px", paddingLeft: "10px", borderLeft: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{user.email}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
