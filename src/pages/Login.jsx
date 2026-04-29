import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth"; // Import signOut here
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState(""); // New error state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); // Set loading to true when login starts
    setError(""); // Clear any previous errors

    try {
      // Step 1: Sign in the user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Step 2: Get the user data from Firestore to check their role
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        // Step 3: Handle role-based navigation
        if (userRole === "suspended") {
          setError("Your account has been suspended. Please contact support.");
          await signOut(auth); // Sign out the user immediately
        } else if (userRole === "admin") {
          navigate("/admin"); // Redirect to admin page
        } else {
          navigate("/"); // Redirect to home page for normal users
        }
      } else {
        setError("User data not found in Firestore.");
      }
    } catch (error) {
      setError("Login failed: " + error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  return (
    <div className="container" style={{ padding: "80px 20px", display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>Email Address</label>
          </div>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <div style={{ marginBottom: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>Password</label>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && (
          <div style={{ color: "var(--danger-color)", marginTop: "20px", textAlign: "center", fontSize: "14px", padding: "10px", backgroundColor: "#fee2e2", borderRadius: "6px" }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: "30px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/signup" style={{ color: "var(--primary-color)", textDecoration: "none", fontWeight: "bold" }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
