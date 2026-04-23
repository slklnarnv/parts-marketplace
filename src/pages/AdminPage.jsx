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

  const handleClearTransactions = async () => {
    if (window.confirm("Are you sure you want to clear ALL transaction logs? This cannot be undone.")) {
      try {
        const snapshot = await getDocs(collection(db, "transactions"));
        const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(db, "transactions", d.id)));
        await Promise.all(deletePromises);
        setTransactions([]);
        alert("Transaction log cleared!");
      } catch (err) {
        alert("Failed to clear transactions: " + err.message);
      }
    }
  };

  if (loading)
    return <div className="container" style={{ padding: 20 }}>Loading Admin Dashboard...</div>;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1 style={{ marginBottom: "40px" }}>🛠 Admin Dashboard</h1>

      {/* 1. Transaction Ledger Section */}
      <section className="card" style={{ marginBottom: 40, overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, color: "var(--success-color)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>📜</span> Transaction Log
          </h2>
          <button 
            onClick={handleClearTransactions} 
            className="btn btn-danger" 
            style={{ padding: "5px 15px", fontSize: "13px" }}
            disabled={transactions.length === 0}
          >
            Clear Log
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
              <th style={{ padding: "12px" }}>Date</th>
              <th style={{ padding: "12px" }}>Item</th>
              <th style={{ padding: "12px" }}>Buyer</th>
              <th style={{ padding: "12px" }}>Seller</th>
              <th style={{ padding: "12px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No transactions recorded yet.</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{t.timestamp?.toDate().toLocaleString()}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{t.itemTitle}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{t.buyerEmail}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{t.sellerEmail}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>${t.priceAtPurchase}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* 2. Manage Inventory Section */}
      <section className="card" style={{ marginBottom: 40, overflowX: "auto" }}>
        <h2 style={{ marginBottom: "20px" }}>📦 Manage Inventory</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
              <th style={{ padding: "12px" }}>Item Title</th>
              <th style={{ padding: "12px" }}>Owner</th>
              <th style={{ padding: "12px" }}>Stock</th>
              <th style={{ padding: "12px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px" }}>{l.title}</td>
                <td style={{ padding: "12px", fontSize: "14px" }}>{l.userEmail}</td>
                <td style={{ padding: "12px" }}>{l.count}</td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => handleDeleteListing(l.id)}
                    className="btn btn-danger"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 3. User Accounts Section */}
      <section className="card" style={{ marginBottom: 40, overflowX: "auto" }}>
        <h2 style={{ marginBottom: "20px" }}>👥 User Management</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
              <th style={{ padding: "12px" }}>Email</th>
              <th style={{ padding: "12px" }}>Role</th>
              <th style={{ padding: "12px" }}>Manage Role</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px" }}>{u.email}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ 
                    padding: "2px 8px", 
                    borderRadius: "12px", 
                    fontSize: "12px", 
                    fontWeight: "bold",
                    backgroundColor: u.role === "admin" ? "#dbeafe" : u.role === "suspended" ? "#fee2e2" : "#f1f5f9",
                    color: u.role === "admin" ? "#1e40af" : u.role === "suspended" ? "#991b1b" : "#475569"
                  }}>
                    {u.role || "user"}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  <select
                    value={u.role || "user"}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    style={{ padding: "4px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handlePasswordReset(u.email)}
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => handleSuspendUser(u.id, u.role)}
                      className="btn btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px", color: u.role === "suspended" ? "var(--success-color)" : "var(--danger-color)" }}
                    >
                      {u.role === "suspended" ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
