import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, setDoc, doc } from "firebase/firestore";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role is 'user'
  const navigate = useNavigate();

  const handleSignUp = async () => {
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

      // Step 4: Redirect to login page after successful sign-up
      navigate("/login"); // Redirect to the login page after sign-up
    } catch (e) {
      alert("Error: " + e.message); // Handle any errors that may occur
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign Up</h2>

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

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">Normal User</option>
        <option value="admin">Admin</option>
      </select>
      <br />
      <br />

      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
