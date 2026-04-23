import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth"; // Import the useAuth hook

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ padding: "100px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Checking permissions...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" />; // Redirect to home if not logged in or not an admin
  }

  return children; // Show the Admin page if the user is an admin
};

export default AdminRoute;
