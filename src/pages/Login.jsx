import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth"; // Import signOut here
import { auth } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
      const db = getFirestore();
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
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}{" "}
          {/* Display loading text while logging in */}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}{" "}
      {/* Show error message */}
    </div>
  );
}
