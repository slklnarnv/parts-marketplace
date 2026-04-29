import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase"; // Use the centralized auth export

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check the user's authentication state using the centralized auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Simplified: sets true if user exists, false if null
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  return (
    <div className="container home-hero" style={{ padding: "80px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🚢 Ship Parts Marketplace</h1>
      <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 40px" }}>
        The most reliable platform to buy and sell marine spare parts easily. 
        Join thousands of professionals in the maritime industry.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}
      >
        <Link to="/listings" className="btn btn-primary" style={{ minWidth: "180px", fontSize: "1rem" }}>
          View All Listings
        </Link>

        {isLoggedIn ? (
          <>
            <Link to="/my-listings" className="btn btn-secondary" style={{ minWidth: "180px", fontSize: "1rem" }}>
              My Listings
            </Link>
            <Link to="/add" className="btn btn-primary" style={{ minWidth: "180px", fontSize: "1rem", backgroundColor: "var(--success-color)" }}>
              + Add a Part
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn btn-secondary" style={{ minWidth: "180px", fontSize: "1rem" }}>
            Login to Start Selling
          </Link>
        )}
      </div>

      <div className="grid" style={{ marginTop: "80px", textAlign: "left" }}>
        <div className="card">
          <h3>Wide Selection</h3>
          <p>Find everything from engines to navigation equipment for any vessel type.</p>
        </div>
        <div className="card">
          <h3>Secure Trades</h3>
          <p>Verified sellers and transparent transaction history for peace of mind.</p>
        </div>
        <div className="card">
          <h3>Global Reach</h3>
          <p>Connect with buyers and sellers from major ports across the globe.</p>
        </div>
      </div>
    </div>
  );
}

