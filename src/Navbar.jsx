import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./useAuth";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAdmin, loading } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
    <>
      <nav className="navbar">
        <div className="container navbar-content">
          {/* Logo */}
          <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary-color)" }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>🚢 MarineParts</Link>
          </div>

          {/* Desktop links */}
          <div className="navbar-links navbar-desktop">
            <Link to="/">Home</Link>
            <Link to="/listings">Listings</Link>
            <Link to="/cart" style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              My Cart
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-16px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none"
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
                  <Link to="/admin" style={{ color: "var(--primary-color)" }}>Admin</Link>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "10px", paddingLeft: "10px", borderLeft: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{user.email}</span>
                  <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile right side: cart badge + hamburger */}
          <div className="navbar-mobile-right">
            <Link to="/cart" style={{ position: "relative", display: "flex", alignItems: "center", textDecoration: "none", color: "var(--text-main)", marginRight: "4px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-8px",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-inner">
              <Link to="/" className="mobile-nav-link">🏠 Home</Link>
              <Link to="/listings" className="mobile-nav-link">📋 Listings</Link>
              <Link to="/cart" className="mobile-nav-link">
                🛒 My Cart {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </Link>
              {user ? (
                <>
                  <Link to="/add" className="mobile-nav-link">➕ Add Listing</Link>
                  <Link to="/my-listings" className="mobile-nav-link">📦 My Listings</Link>
                  <Link to="/orders" className="mobile-nav-link">📜 Order History</Link>
                  {isAdmin && (
                    <Link to="/admin" className="mobile-nav-link" style={{ color: "var(--primary-color)" }}>⚙️ Admin</Link>
                  )}
                  <div className="mobile-menu-divider" />
                  <div style={{ padding: "8px 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>{user.email}</div>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ width: "100%", marginTop: "8px" }}>
                    Logout
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                  <Link to="/login" className="btn btn-secondary" style={{ textAlign: "center" }}>Login</Link>
                  <Link to="/signup" className="btn btn-primary" style={{ textAlign: "center" }}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay to close menu on outside click */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "transparent"
          }}
        />
      )}
    </>
  );
}
