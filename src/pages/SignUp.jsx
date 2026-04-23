import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, setDoc, doc } from "firebase/firestore";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role is 'user'
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    try {
      // Step 1: Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Step 2: Get the user from Firebase Authentication
      const user = userCredential.user;

      // Step 3: Set the role in Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role, // Role can be 'user' or 'admin'
      });

      alert("User created successfully");

      // Step 4: Redirect to home page after successful sign-up
      navigate("/"); // Redirect to the home page after sign-up
    } catch (e) {
      alert("Error: " + e.message); // Handle any errors that may occur
    }
  };

  return (
    <div className="container" style={{ padding: "80px 20px", display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Create Account</h2>
        <form onSubmit={handleSignUp}>
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
          <div style={{ marginBottom: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>Account Type</label>
          </div>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
            style={{ appearance: "none", backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px top 50%", backgroundSize: "12px auto" }}
          >
            <option value="user">Normal User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}>
            Sign Up
          </button>
        </form>
        <div style={{ marginTop: "30px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary-color)", textDecoration: "none", fontWeight: "bold" }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
