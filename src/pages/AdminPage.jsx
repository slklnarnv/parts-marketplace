import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

export default function AdminPage() {
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]); // New state for the ledger
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch listings
      const listingsSnapshot = await getDocs(collection(db, "listings"));
      setListings(
        listingsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      setUsers(usersSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Fetch Transaction Ledger (New)
      const transQuery = query(
        collection(db, "transactions"),
        orderBy("timestamp", "desc")
      );
      const transSnapshot = await getDocs(transQuery);
      setTransactions(
        transSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteListing = async (listingId) => {
    if (window.confirm("Delete this listing forever?")) {
      try {
        await deleteDoc(doc(db, "listings", listingId));
        setListings(listings.filter((l) => l.id !== listingId));
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert("Role update failed: " + err.message);
    }
  };

  const handleSuspendUser = async (userId, currentRole) => {
    const newRole = currentRole === "suspended" ? "user" : "suspended";
    await handleRoleChange(userId, newRole);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Delete this user account?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        alert("User deletion failed.");
      }
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset email sent to " + email);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading)
    return <div style={{ padding: 20 }}>Loading Admin Dashboard...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🛠 Admin Dashboard</h1>

      {/* 1. Transaction Ledger Section (New) */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ color: "green" }}>📜 Transaction Ledger (Sales Log)</h2>
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e8f5e9" }}>
              <th>Date</th>
              <th>Item</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5">No transactions recorded yet.</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.timestamp?.toDate().toLocaleString()}</td>
                  <td>{t.itemTitle}</td>
                  <td>{t.buyerEmail}</td>
                  <td>{t.sellerEmail}</td>
                  <td>${t.priceAtPurchase}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 2. Manage Inventory Table */}
      <section style={{ marginBottom: 40 }}>
        <h2>Manage Inventory</h2>
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th>Part Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Seller</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>${l.price}</td>
                <td>{l.count}</td>
                <td>{l.userEmail}</td>
                <td>
                  <button
                    onClick={() => handleDeleteListing(l.id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 3. Manage Users Table */}
      <section>
        <h2>Manage Users</h2>
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handlePasswordReset(u.email)}>
                    Reset Pass
                  </button>

                  <button
                    onClick={() => handleSuspendUser(u.id, u.role)}
                    style={{
                      marginLeft: 5,
                      backgroundColor:
                        u.role === "suspended" ? "#ffc107" : "#6c757d",
                      color: "white",
                    }}
                  >
                    {u.role === "suspended" ? "Unsuspend User" : "Suspend User"}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    style={{ marginLeft: 5, color: "red" }}
                  >
                    Delete User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
