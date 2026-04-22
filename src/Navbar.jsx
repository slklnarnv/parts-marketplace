import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./useAuth"; // Importing the centralized auth hook

export default function Navbar() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

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
      <nav style={{ padding: 10, borderBottom: "1px solid gray" }}>
        Loading...
      </nav>
    );
  }

  return (
    <nav style={{ padding: 10, borderBottom: "1px solid gray" }}>
      <Link to="/">Home</Link> | <Link to="/listings">Listings</Link>
      {user ? (
        <>
          {" "}
          | <Link to="/add">Add Listing</Link> |{" "}
          <Link to="/my-listings">My Listings</Link> |{" "}
          <span style={{ marginLeft: 10 }}>👤 {user.email}</span>
          <button onClick={handleLogout} style={{ marginLeft: 10 }}>
            Logout
          </button>
          {/* Show Admin link only if the user role is admin */}
          {isAdmin && (
            <Link
              to="/admin"
              style={{ marginLeft: 10, color: "blue", fontWeight: "bold" }}
            >
              Admin Dashboard
            </Link>
          )}
        </>
      ) : (
        <>
          {" "}
          | <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
