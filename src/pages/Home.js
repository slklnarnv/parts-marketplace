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
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>🚢 Ship Parts Marketplace</h1>
      <p style={{ fontSize: "1.2rem", color: "#555" }}>
        The most reliable platform to buy and sell marine spare parts easily.
      </p>

      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <Link to="/listings">
          <button
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              width: "200px",
            }}
          >
            View All Listings
          </button>
        </Link>

        {/* If logged in, show 'My Listings' and 'Add Part' */}
        {isLoggedIn ? (
          <>
            <Link to="/my-listings">
              <button
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  width: "200px",
                }}
              >
                My Listings
              </button>
            </Link>
            <Link to="/add">
              <button
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  width: "200px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                + Add a Part
              </button>
            </Link>
          </>
        ) : (
          /* Only show Login link if user is not logged in */
          <Link to="/login">
            <button
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                width: "200px",
              }}
            >
              Login to Start Selling
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
