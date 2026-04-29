import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "6rem", marginBottom: "10px", lineHeight: "1" }}>🧭</div>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>404</h1>
      <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "30px", maxWidth: "450px", margin: "0 auto 30px" }}>
        Looks like this page drifted off course. The page you're looking for doesn't exist.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
        <Link to="/listings" className="btn btn-secondary">Browse Listings</Link>
      </div>
    </div>
  );
}
